import { useEffect, useRef, useState } from 'react';
import MP4Box, { type MP4ArrayBuffer, type MP4Sample } from 'mp4box';

const LERP_TAU = 8;
const SNAP = 0.002;
const LRU_MAX = 24;
const LEAD = 24;
const WATCHDOG = 60000;

type BankFrame = { ts: number; blob: Blob };

type Demuxed = {
  codec: string;
  width: number;
  height: number;
  description?: Uint8Array;
  samples: MP4Sample[];
};

function demux(buffer: ArrayBuffer): Promise<Demuxed> {
  return new Promise((resolve, reject) => {
    const file = MP4Box.createFile();
    const samples: MP4Sample[] = [];
    let meta: Omit<Demuxed, 'samples'> | null = null;
    let expected = 0;

    file.onError = (e) => reject(new Error(e));
    file.onReady = (info) => {
      const track = info.videoTracks[0];
      if (!track) return reject(new Error('No video track'));
      const entry = file.getTrackById(track.id).mdia.minf.stbl.stsd.entries[0];
      const box = entry.avcC ?? entry.hvcC ?? entry.vpcC ?? entry.av1C;
      let description: Uint8Array | undefined;
      if (box) {
        const stream = new MP4Box.DataStream(undefined, 0, MP4Box.DataStream.BIG_ENDIAN);
        box.write(stream);
        description = new Uint8Array(stream.buffer, 8); // strip box header
      }
      meta = { codec: track.codec, width: track.video.width, height: track.video.height, description };
      expected = track.nb_samples;
      file.setExtractionOptions(track.id, null, { nbSamples: expected });
      file.start();
    };
    file.onSamples = (_id, _user, batch) => {
      samples.push(...batch);
    };

    const buf = buffer as MP4ArrayBuffer;
    buf.fileStart = 0;
    file.appendBuffer(buf);
    file.flush();

    if (!meta) return reject(new Error('MP4 not ready'));
    resolve({ ...(meta as Omit<Demuxed, 'samples'>), samples });
  });
}

async function decodeToBank(
  d: Demuxed,
  hardwareAcceleration: HardwareAcceleration,
  isCancelled: () => boolean,
): Promise<BankFrame[]> {
  const config: VideoDecoderConfig = {
    codec: d.codec,
    codedWidth: d.width,
    codedHeight: d.height,
    description: d.description,
    hardwareAcceleration,
  };
  const support = await VideoDecoder.isConfigSupported(config);
  if (!support.supported) throw new Error(`Unsupported config (${hardwareAcceleration})`);

  const bank: BankFrame[] = [];
  const off = document.createElement('canvas');
  off.width = d.width;
  off.height = d.height;
  const offCtx = off.getContext('2d')!;
  let pending = 0;
  let error: unknown = null;

  const decoder = new VideoDecoder({
    output: (frame) => {
      const ts = frame.timestamp;
      offCtx.drawImage(frame, 0, 0, off.width, off.height);
      frame.close();
      pending++;
      off.toBlob(
        (blob) => {
          if (blob) bank.push({ ts, blob });
          pending--;
        },
        'image/webp',
        0.82,
      );
    },
    error: (e) => {
      error = e;
    },
  });
  decoder.configure(config);

  const wait = () => new Promise((r) => setTimeout(r, 4));

  try {
    for (const s of d.samples) {
      if (error) throw error;
      if (isCancelled()) return [];
      // Throttle so decoding never outruns blob encoding.
      while (decoder.decodeQueueSize + pending > LEAD) {
        if (error) throw error;
        await wait();
      }
      decoder.decode(
        new EncodedVideoChunk({
          type: s.is_sync ? 'key' : 'delta',
          timestamp: (1e6 * s.cts) / s.timescale,
          duration: (1e6 * s.duration) / s.timescale,
          data: s.data,
        }),
      );
    }
    await decoder.flush();
    while (pending > 0) await wait();
    if (error) throw error;
  } finally {
    if (decoder.state !== 'closed') decoder.close();
  }

  if (bank.length === 0) throw new Error('No frames decoded');
  return bank.sort((a, b) => a.ts - b.ts);
}

export function useVideoScrub(videoSrc: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canvasLive, setCanvasLive] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!video || !canvas || !container) return;
    const ctx = canvas.getContext('2d')!;

    let bank: BankFrame[] = [];
    const lru = new Map<number, ImageBitmap | null>();
    let current = 0;
    let target = 0;
    let ready = false;
    let reverted = false;
    let painted = false;
    let building = false;
    let dur = 0;
    let lastDrawn = -1;
    let cancelled = false;
    let raf = 0;
    let last = performance.now();
    let watchdog: ReturnType<typeof setTimeout> | undefined;

    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    let span = 1;
    const measure = () => {
      span = Math.max(1, container.offsetHeight - window.innerHeight);
    };
    measure();
    const getProgress = () => Math.min(1, Math.max(0, window.scrollY / span));

    const onMeta = () => {
      if (!dur && video.duration && isFinite(video.duration)) dur = video.duration;
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener('loadedmetadata', onMeta);

    const nearestIndex = (t: number) => {
      const us = t * 1e6;
      let lo = 0;
      let hi = bank.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (bank[mid].ts < us) lo = mid + 1;
        else hi = mid;
      }
      if (lo > 0 && us - bank[lo - 1].ts < bank[lo].ts - us) lo--;
      return lo;
    };

    const warmLRU = (i: number) => {
      for (let j = i - 1; j <= i + 2; j++) {
        if (j < 0 || j >= bank.length) continue;
        if (lru.has(j)) {
          const v = lru.get(j)!;
          lru.delete(j);
          lru.set(j, v); // bump recency
          continue;
        }
        lru.set(j, null);
        createImageBitmap(bank[j].blob)
          .then((bmp) => {
            if (cancelled || !lru.has(j)) return bmp.close();
            lru.set(j, bmp);
          })
          .catch(() => lru.delete(j));
      }
      while (lru.size > LRU_MAX) {
        const oldest = lru.keys().next().value as number;
        lru.get(oldest)?.close();
        lru.delete(oldest);
      }
    };

    const drawCover = (bmp: ImageBitmap) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / bmp.width, ch / bmp.height);
      const w = bmp.width * scale;
      const h = bmp.height * scale;
      ctx.drawImage(bmp, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const drawFrame = (t: number) => {
      const i = nearestIndex(t);
      warmLRU(i);
      if (i === lastDrawn) return;
      const bmp = lru.get(i);
      if (!bmp) return; // keep previous frame until this one decodes
      drawCover(bmp);
      lastDrawn = i;
      if (!painted) {
        painted = true;
        setCanvasLive(true);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const p = getProgress();
      setScrollProgress(p);

      if (dur > 0) {
        target = p * dur;
        if (reducedMq.matches) {
          current = target;
        } else {
          current += (target - current) * (1 - Math.exp(-dt * LERP_TAU));
          if (Math.abs(target - current) < SNAP) current = target;
        }
        if (ready) {
          drawFrame(current);
        } else if (!video.seeking && Math.abs(video.currentTime - current) > 0.01) {
          video.currentTime = current;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const revert = () => {
      reverted = true;
      ready = false;
      building = false;
      bank = [];
      lru.forEach((b) => b?.close());
      lru.clear();
      setCanvasLive(false);
    };

    const build = async () => {
      if (building || reverted || reducedMq.matches || typeof VideoDecoder === 'undefined') return;
      building = true;
      watchdog = setTimeout(() => {
        if (!ready) revert();
      }, WATCHDOG);
      try {
        const res = await fetch(videoSrc, { mode: 'cors' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await demux(await res.arrayBuffer());
        const isCancelled = () => cancelled || reverted;
        let frames: BankFrame[];
        try {
          frames = await decodeToBank(d, 'prefer-hardware', isCancelled);
        } catch {
          if (isCancelled()) return;
          frames = await decodeToBank(d, 'prefer-software', isCancelled);
        }
        if (isCancelled()) return;
        bank = frames;
        if (!dur) dur = bank[bank.length - 1].ts / 1e6;
        ready = true;
        clearTimeout(watchdog);
      } catch (e) {
        if (!cancelled) {
          console.warn('[useVideoScrub] frame bank unavailable, using video seeking', e);
          revert();
        }
      } finally {
        building = false;
      }
    };

    const onLoad = () => void build();
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad);

    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(watchdog);
      video.removeEventListener('loadedmetadata', onMeta);
      window.removeEventListener('load', onLoad);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      lru.forEach((b) => b?.close());
      lru.clear();
    };
  }, [videoSrc]);

  return { containerRef, videoRef, canvasRef, scrollProgress, canvasLive };
}
