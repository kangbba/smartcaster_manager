"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MediaFile, Slide } from "@/lib/types";
import { getFileIcon } from "@/lib/utils/fileIcons";
import { getMediaGeometry, getMediaRenderStyle, getTextRenderStyle } from "@/lib/utils/slidePreview";
import type { ElementType } from "./SlideElementPanels";
import { SelectionHandles } from "./SelectionHandles";

interface SlideCanvasProps {
  slide: Slide;
  media: MediaFile[];
  selectedMediaName: string | null;
  timelinePosition: number;
  onApplyMedia: (mediaName: string) => void;
  onUpdateSlide: (updater: (prev: Slide) => Slide) => void;
  onRequestEditPanel: () => void;
  onSelectElement?: (element: ElementType) => void;
}

export default function SlideCanvas({
  slide,
  media,
  selectedMediaName,
  timelinePosition,
  onApplyMedia,
  onUpdateSlide,
  onRequestEditPanel,
  onSelectElement,
}: SlideCanvasProps) {
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false);
  const [isDraggingMedia, setIsDraggingMedia] = useState<boolean>(false);
  const [isResizingMedia, setIsResizingMedia] = useState<boolean>(false);
  const [isResizingText, setIsResizingText] = useState<boolean>(false);
  const [activeHandle, setActiveHandle] = useState<"nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<"media" | "text" | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const mediaDragStartRef = useRef<{ x: number; y: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; scaleX: number; scaleY: number } | null>(null);
  const textResizeStartRef = useRef<{ x: number; y: number; fontSize: number } | null>(null);
  const [screenSize, setScreenSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [screenOffset, setScreenOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [textSize, setTextSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [mediaSize, setMediaSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    if (!isDraggingText && !isResizingText) return;
    const handleMouseUp = () => {
      setIsDraggingText(false);
      setIsResizingText(false);
      dragOffsetRef.current = null;
      textResizeStartRef.current = null;
      if (!isResizingText) {
        setActiveHandle(null);
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isDraggingText, isResizingText]);

  useEffect(() => {
    if (!isDraggingMedia && !isResizingMedia) return;
    const handleMouseUp = () => {
      setIsDraggingMedia(false);
      setIsResizingMedia(false);
      setActiveHandle(null);
      mediaDragStartRef.current = null;
      resizeStartRef.current = null;
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isDraggingMedia, isResizingMedia]);

  useLayoutEffect(() => {
    if (!screenRef.current || !workspaceRef.current) return;
    const screenEl = screenRef.current;
    const workspaceEl = workspaceRef.current;
    const updateSizes = () => {
      const screenRect = screenEl.getBoundingClientRect();
      const workspaceRect = workspaceEl.getBoundingClientRect();
      setScreenSize({ width: screenRect.width, height: screenRect.height });
      setScreenOffset({
        x: screenRect.left - workspaceRect.left,
        y: screenRect.top - workspaceRect.top,
      });
      if (textRef.current) {
        const textRect = textRef.current.getBoundingClientRect();
        setTextSize({ width: textRect.width, height: textRect.height });
      }
    };

    updateSizes();

    const observer = new ResizeObserver(() => updateSizes());
    observer.observe(screenEl);
    observer.observe(workspaceEl);
    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => observer.disconnect();
  }, [
    slide.text,
    slide.fontSize,
    slide.textAnimation,
    slide.resolutionWidth,
    slide.resolutionHeight,
  ]);

  useLayoutEffect(() => {
    if (!mediaRef.current) return;
    const el = mediaRef.current;
    const updateMediaSize = () => {
      if (el instanceof HTMLImageElement) {
        setMediaSize({
          width: el.naturalWidth || el.width || 0,
          height: el.naturalHeight || el.height || 0,
        });
      } else {
        setMediaSize({
          width: el.videoWidth || el.clientWidth || 0,
          height: el.videoHeight || el.clientHeight || 0,
        });
      }
    };
    updateMediaSize();
    if (el instanceof HTMLImageElement) {
      el.addEventListener("load", updateMediaSize);
    } else {
      el.addEventListener("loadedmetadata", updateMediaSize);
    }
    return () => {
      if (el instanceof HTMLImageElement) {
        el.removeEventListener("load", updateMediaSize);
      } else {
        el.removeEventListener("loadedmetadata", updateMediaSize);
      }
    };
  }, [slide.image, slide.video]);

  const handleApplyMedia = () => {
    if (!selectedMediaName) return;
    const selected = media.find((item) => item.name === selectedMediaName);
    if (!selected) return;
    onApplyMedia(selectedMediaName);
  };

  const mediaItem = slide.image || slide.video
    ? media.find((m) => m.name === (slide.image || slide.video))
    : null;

  const mediaBounds = (() => {
    if (!mediaItem) return null;
    if (!screenSize.width || !screenSize.height) return null;
    const containerW = screenSize.width;
    const containerH = screenSize.height;
    const mediaW = mediaSize.width || 0;
    const mediaH = mediaSize.height || 0;
    const geometry = getMediaGeometry(slide, containerW, containerH, mediaW, mediaH);
    const centerX = screenOffset.x + containerW / 2 + geometry.offsetX;
    const centerY = screenOffset.y + containerH / 2 + geometry.offsetY;
    return {
      left: centerX - geometry.actualWidth / 2,
      top: centerY - geometry.actualHeight / 2,
      width: geometry.actualWidth,
      height: geometry.actualHeight,
    };
  })();

  const textBounds = (() => {
    if (!slide.text) return null;
    if (!screenSize.width || !screenSize.height) return null;
    const x = screenOffset.x + ((slide.textPositionX ?? 50) / 100) * screenSize.width;
    const y = screenOffset.y + ((slide.textPositionY ?? 50) / 100) * screenSize.height;
    return {
      left: x - textSize.width / 2,
      top: y - textSize.height / 2,
      width: textSize.width,
      height: textSize.height,
    };
  })();

  return (
    <div
      ref={workspaceRef}
      className="w-full max-w-5xl aspect-video relative flex items-center justify-center cursor-pointer"
      onClick={() => {
        setSelectedLayer(null);
        if (onSelectElement) onSelectElement(null);
      }}
      onMouseMove={(e) => {
        if (isDraggingMedia && screenRef.current) {
          const rect = screenRef.current.getBoundingClientRect();
          const start = mediaDragStartRef.current;
          if (!start) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          const nextX = (slide.mediaOffsetX ?? 0) + (dx / rect.width) * 100;
          const nextY = (slide.mediaOffsetY ?? 0) + (dy / rect.height) * 100;
          mediaDragStartRef.current = { x: e.clientX, y: e.clientY };
          onUpdateSlide((prev) => ({
            ...prev,
            mediaOffsetX: nextX,
            mediaOffsetY: nextY,
          }));
          return;
        }
        if (isResizingMedia && screenRef.current && activeHandle) {
          const rect = screenRef.current.getBoundingClientRect();
          const start = resizeStartRef.current;
          if (!start) return;
          const dx = (e.clientX - start.x) / rect.width;
          const dy = (e.clientY - start.y) / rect.height;
          const baseScaleX = start.scaleX;
          const baseScaleY = start.scaleY;
          const factorX = 1 + (activeHandle.includes("e") ? dx : -dx);
          const factorY = 1 + (activeHandle.includes("s") ? dy : -dy);
          let nextScaleX = Math.max(0.1, baseScaleX * factorX);
          let nextScaleY = Math.max(0.1, baseScaleY * factorY);
          if (e.shiftKey) {
            const uniform = Math.max(nextScaleX, nextScaleY);
            nextScaleX = uniform;
            nextScaleY = uniform;
          }
          onUpdateSlide((prev) => ({
            ...prev,
            mediaScaleX: nextScaleX,
            mediaScaleY: nextScaleY,
          }));
          return;
        }
        if (isResizingText && screenRef.current && activeHandle) {
          const start = textResizeStartRef.current;
          if (!start) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          // Calculate distance from origin for scaling
          const distance = Math.sqrt(dx * dx + dy * dy);
          const factor = 1 + (distance / 100) * (dx + dy > 0 ? 1 : -1);
          const nextFontSize = Math.max(12, Math.min(120, Math.round(start.fontSize * factor)));
          onUpdateSlide((prev) => ({
            ...prev,
            fontSize: nextFontSize,
          }));
          return;
        }
        if (!isDraggingText || !screenRef.current) return;
        const effect = slide.textAnimation || "none";
        const rect = screenRef.current.getBoundingClientRect();
        const offset = dragOffsetRef.current || { x: 0, y: 0 };
        const rawX = e.clientX - rect.left - offset.x;
        const rawY = e.clientY - rect.top - offset.y;
        const clampedX = Math.max(0, Math.min(rect.width, rawX));
        const clampedY = Math.max(0, Math.min(rect.height, rawY));
        const nextX = (clampedX / rect.width) * 100;
        const nextY = (clampedY / rect.height) * 100;
        const lockedX = effect === "slide-horizontal";
        const lockedY = effect === "slide-vertical";
        onUpdateSlide((prev) => ({
          ...prev,
          textPositionX: lockedX ? 50 : nextX,
          textPositionY: lockedY ? 50 : nextY,
        }));
      }}
      onMouseLeave={() => {
        if (isDraggingText) {
          setIsDraggingText(false);
          dragOffsetRef.current = null;
        }
      }}
      onDragOver={(e) => {
        if (selectedMediaName) {
          e.preventDefault();
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        handleApplyMedia();
      }}
    >
      <div
        ref={screenRef}
        className="absolute w-[82%] h-[82%] rounded-lg shadow-2xl overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: slide.backgroundColor }}
        onClick={(e) => {
          // 배경 클릭 시 배경 편집 패널 표시
          if (e.target === e.currentTarget) {
            e.stopPropagation();
            setSelectedLayer(null);
            if (onSelectElement) onSelectElement("background");
          }
        }}
      >
        {mediaItem && (() => {
          const containerW = screenSize.width || 1;
          const containerH = screenSize.height || 1;
          const mediaW = mediaSize.width || 0;
          const mediaH = mediaSize.height || 0;
          const { style: commonStyle } = getMediaRenderStyle(
            slide,
            containerW,
            containerH,
            mediaW,
            mediaH,
            timelinePosition
          );

          return (
            <div
              className="absolute inset-0"
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedLayer("media");
                if (onSelectElement) onSelectElement("image");
                setIsDraggingMedia(true);
                mediaDragStartRef.current = { x: e.clientX, y: e.clientY };
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLayer("media");
                if (onSelectElement) onSelectElement("image");
              }}
            >
              {mediaItem.type === "image" && mediaItem.url ? (
                <img
                  ref={mediaRef as React.MutableRefObject<HTMLImageElement | null>}
                  src={mediaItem.url}
                  alt={mediaItem.name}
                  style={commonStyle}
                  className="absolute select-none object-cover"
                  draggable={false}
                />
              ) : mediaItem.type === "video" && mediaItem.url ? (
                <video
                  ref={mediaRef as React.MutableRefObject<HTMLVideoElement | null>}
                  src={mediaItem.url}
                  style={commonStyle}
                  className="absolute select-none object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <span className="text-9xl opacity-30">{getFileIcon(mediaItem.type)}</span>
              )}
            </div>
          );
        })()}
      </div>

      {slide.text && (() => {
        const { textPosX, textPosY, style } = getTextRenderStyle({
          slide,
          timelinePosition,
          screenSize,
          screenOffset,
          textSize,
        });

        return (
          <div
            ref={textRef}
            className={`absolute select-none whitespace-pre-wrap text-center px-4 py-2 ${
              isDraggingText ? "cursor-grabbing" : "cursor-move"
            }`}
            style={style}
            onMouseDown={(e) => {
              if (!screenRef.current) return;
              e.preventDefault();
              setSelectedLayer("text");
              if (onSelectElement) onSelectElement("text");
              const rect = screenRef.current.getBoundingClientRect();
              const currentX = (textPosX / 100) * rect.width;
              const currentY = (textPosY / 100) * rect.height;
              dragOffsetRef.current = {
                x: e.clientX - rect.left - currentX,
                y: e.clientY - rect.top - currentY,
              };
              setIsDraggingText(true);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLayer("text");
              if (onSelectElement) onSelectElement("text");
            }}
          >
            {slide.text}
          </div>
        );
      })()}

      {selectedLayer === "media" && mediaBounds && (
        <div
          className="absolute bg-white rounded-md shadow px-2 py-1 flex items-center gap-2"
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            left: mediaBounds.left,
            top: Math.max(0, mediaBounds.top - 28),
          }}
        >
          <button
            className="text-xs text-gray-700 hover:text-black"
            onClick={() =>
              onUpdateSlide((prev) => ({
                ...prev,
                mediaScaleX: 1,
                mediaScaleY: 1,
                mediaOffsetX: 0,
                mediaOffsetY: 0,
              }))
            }
          >
            맞춤
          </button>
          <button
            className="text-xs text-red-600 hover:text-red-700"
            onClick={() =>
              onUpdateSlide((prev) => ({
                ...prev,
                image: undefined,
                video: undefined,
                mediaId: undefined,
                mediaScaleX: undefined,
                mediaScaleY: undefined,
                mediaOffsetX: undefined,
                mediaOffsetY: undefined,
              }))
            }
          >
            삭제
          </button>
        </div>
      )}

      {selectedLayer === "text" && textBounds && (
        <div
          className="absolute bg-white rounded-md shadow px-2 py-1 flex items-center gap-2"
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            left: textBounds.left,
            top: Math.max(0, textBounds.top - 28),
          }}
        >
          <button
            className="text-xs text-red-600 hover:text-red-700"
            onClick={() =>
              onUpdateSlide((prev) => ({
                ...prev,
                text: undefined,
              }))
            }
          >
            삭제
          </button>
        </div>
      )}

      {selectedLayer === "media" && mediaBounds && (
        <SelectionHandles
          bounds={mediaBounds}
          onResizeStart={(handle, e) => {
            e.stopPropagation();
            setSelectedLayer("media");
            setIsResizingMedia(true);
            setActiveHandle(handle);
            resizeStartRef.current = {
              x: e.clientX,
              y: e.clientY,
              scaleX: slide.mediaScaleX ?? 1,
              scaleY: slide.mediaScaleY ?? 1,
            };
          }}
        />
      )}

      {selectedLayer === "text" && textBounds && (
        <SelectionHandles
          bounds={textBounds}
          onResizeStart={(handle, e) => {
            e.stopPropagation();
            setSelectedLayer("text");
            setIsResizingText(true);
            setActiveHandle(handle);
            textResizeStartRef.current = {
              x: e.clientX,
              y: e.clientY,
              fontSize: slide.fontSize || 32,
            };
          }}
        />
      )}

      {!slide.text && !slide.image && !slide.video && (
        <div className="text-gray-400 text-center">
          <p className="text-lg mb-2">빈 캔버스</p>
          <p className="text-sm">왼쪽에서 미디어를 드래그하거나<br />캔버스를 클릭하여 편집하세요</p>
        </div>
      )}
    </div>
  );
}
