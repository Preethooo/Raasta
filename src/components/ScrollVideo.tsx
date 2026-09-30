import { useEffect, useRef } from 'react';

const LERP_TAU = 7;

/**
 * A short clip whose playback follows the page scroll: frame 0 as it enters the
 * bottom of the screen, the last frame as it leaves the top. Clips are encoded with
 * a keyframe every 10 frames so seeking stays smooth.
 * Only runs while on screen; reduced-motion users get the poster frame.
 */
export function ScrollVideo({ src, poster, className = '' }: { src: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let visible = false;
    let current = 0;
    let last = performance.now();
    let primed = false;

    // iOS Safari won't paint seeked frames until the video has been played once.
    const prime = () => {
      if (primed) return;
      primed = true;
      video.play().then(() => video.pause()).catch(() => {});
    };

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const dur = video.duration;
      if (dur && isFinite(dur)) {
        const r = video.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        const target = p * (dur - 0.05);
        current += (target - current) * (1 - Math.exp(-dt * LERP_TAU));
        if (!video.seeking && Math.abs(video.currentTime - current) > 1 / 30) video.currentTime = current;
      }
      if (visible) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (video.preload !== 'auto') video.preload = 'auto';
          prime();
          last = performance.now();
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(video);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      playsInline
      preload="metadata"
      disablePictureInPicture
      className={`object-cover ${className}`}
    />
  );
}
