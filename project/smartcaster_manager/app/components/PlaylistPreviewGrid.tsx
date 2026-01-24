"use client";

import { getFileIcon } from "@/lib/utils/fileIcons";

type PreviewSlide = {
  id: string;
  name: string;
  kind: "text" | "image" | "video" | "empty";
  backgroundColor: string;
};

interface PlaylistPreviewGridProps {
  slides: PreviewSlide[];
  columns?: number;
  size?: "sm" | "md";
  showNames?: boolean;
}

export default function PlaylistPreviewGrid({
  slides,
  columns = 4,
  size = "md",
  showNames = true,
}: PlaylistPreviewGridProps) {
  const maxItems = columns * 2;
  const visible = slides.slice(0, maxItems);
  const emptyCount = Math.max(0, maxItems - visible.length);
  const iconClass = size === "sm" ? "text-[10px]" : "text-xl";
  const nameClass = size === "sm" ? "text-[8px]" : "text-[9px]";

  return (
    <div className={`grid gap-2 h-full`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {visible.map((preview) => (
        <div
          key={preview.id}
          className="rounded-md overflow-hidden flex flex-col items-center justify-center"
          style={{ backgroundColor: preview.backgroundColor }}
        >
          <span className={`${iconClass} opacity-80`}>{getFileIcon(preview.kind)}</span>
          {showNames && (
            <span className={`${nameClass} text-white/90 mt-1 px-1 truncate w-full text-center`}>
              {preview.name}
            </span>
          )}
        </div>
      ))}
      {Array.from({ length: emptyCount }).map((_, idx) => (
        <div key={`empty-${idx}`} className="rounded-md bg-white/40" />
      ))}
    </div>
  );
}
