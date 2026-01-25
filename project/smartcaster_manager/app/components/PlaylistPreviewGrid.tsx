"use client";

import type { Slide, MediaFile } from "@/lib/types";
import SlideThumbnail from "./SlideThumbnail";

export type PreviewSlideData = {
  slide: Slide;
  media: MediaFile | null;
};

interface PlaylistPreviewGridProps {
  slides: PreviewSlideData[];
  columns?: number;
}

export default function PlaylistPreviewGrid({
  slides,
  columns = 4,
}: PlaylistPreviewGridProps) {
  const maxItems = columns * 2;
  const visible = slides.slice(0, maxItems);
  const emptyCount = Math.max(0, maxItems - visible.length);

  return (
    <div className="grid gap-2 h-full" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {visible.map(({ slide, media }) => (
        <div
          key={slide.id}
          className="rounded-md overflow-hidden relative aspect-video"
          style={{ backgroundColor: slide.backgroundColor }}
        >
          <SlideThumbnail slide={slide} media={media} />
        </div>
      ))}
      {Array.from({ length: emptyCount }).map((_, idx) => (
        <div key={`empty-${idx}`} className="rounded-md bg-white/40 aspect-video" />
      ))}
    </div>
  );
}
