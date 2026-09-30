import VIDEOS from './videos.json' with { type: 'json' };

/** Short itinerary clips (public/videos/days), with credits for the /credits page. */
export type Video = {
  id: string;
  file: string;
  poster: string;
  caption: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  sourceUrl: string;
};

export const VIDEO_LIBRARY = VIDEOS as Record<string, Video>;

export function getVideo(id: string): Video {
  const v = VIDEO_LIBRARY[id];
  if (!v) throw new Error(`Unknown video "${id}"`);
  return v;
}
