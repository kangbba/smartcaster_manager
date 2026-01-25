"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { MediaFile, Slide } from "@/lib/types";
import { getFileIcon } from "@/lib/utils/fileIcons";
import { getMediaRenderStyle, getTextRenderStyle } from "@/lib/utils/slidePreview";
import { useElementSize } from "@/lib/hooks";

interface SlideThumbnailProps {
  slide: Slide;
  media?: MediaFile | null;
}

export default function SlideThumbnail({ slide, media }: SlideThumbnailProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useElementSize(containerRef);
  const [mediaSize, setMediaSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [textSize, setTextSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const resolutionWidth = slide.resolutionWidth || 1920;
  const resolutionHeight = slide.resolutionHeight || 1080;
  const scale = width && height
    ? Math.min(width / resolutionWidth, height / resolutionHeight)
    : 1;
  const unscaledTextSize = {
    width: scale > 0 ? textSize.width / scale : textSize.width,
    height: scale > 0 ? textSize.height / scale : textSize.height,
  };
  const textRender = getTextRenderStyle({
    slide,
    timelinePosition: 0,
    screenSize: { width: resolutionWidth, height: resolutionHeight },
    textSize: unscaledTextSize,
  });

  useLayoutEffect(() => {
    if (!textRef.current) return;
    const rect = textRef.current.getBoundingClientRect();
    setTextSize({ width: rect.width || 0, height: rect.height || 0 });
  }, [slide.text, slide.fontSize, width, height, scale]);

  const { style: mediaStyle } = getMediaRenderStyle(
    slide,
    resolutionWidth,
    resolutionHeight,
    mediaSize.width,
    mediaSize.height
  );

  return (
    <div ref={containerRef} className="absolute inset-0">
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: `${resolutionWidth}px`,
          height: `${resolutionHeight}px`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        {(slide.image || slide.video) && media ? (
          <div className="absolute inset-0">
          {media.type === "image" && media.url ? (
            <img
              ref={mediaRef as React.MutableRefObject<HTMLImageElement | null>}
              src={media.url}
              alt={media.name}
              className="absolute select-none object-cover"
              style={mediaStyle}
              draggable={false}
              onLoad={(e) => {
                const target = e.currentTarget;
                setMediaSize({
                  width: target.naturalWidth || target.width || 0,
                  height: target.naturalHeight || target.height || 0,
                });
              }}
            />
          ) : media.type === "video" && media.url ? (
            <video
              ref={mediaRef as React.MutableRefObject<HTMLVideoElement | null>}
              src={media.url}
              className="absolute select-none object-cover"
              style={mediaStyle}
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => {
                const target = e.currentTarget;
                setMediaSize({
                  width: target.videoWidth || target.clientWidth || 0,
                  height: target.videoHeight || target.clientHeight || 0,
                });
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl opacity-20">{getFileIcon(media.type)}</span>
            </div>
          )}
          </div>
        ) : (
          !slide.text && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              <span className="text-5xl">📄</span>
            </div>
          )
        )}

        {slide.text && (
          <div className="absolute inset-0">
            <div
              ref={textRef}
              className="absolute text-center px-2"
              style={{
                ...textRender.style,
                lineHeight: "1.2",
                maxWidth: "90%",
                wordBreak: "keep-all",
              }}
            >
              <div className="line-clamp-4">{slide.text}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
