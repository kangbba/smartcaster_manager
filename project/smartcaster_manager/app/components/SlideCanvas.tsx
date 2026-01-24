"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MediaFile, Slide } from "@/lib/types";
import { calculateAnimationState, getAnimationStyle } from "@/lib/animation-specs";
import { getFileIcon } from "@/lib/utils/fileIcons";

interface SlideCanvasProps {
  slide: Slide;
  media: MediaFile[];
  selectedMediaName: string | null;
  timelinePosition: number;
  onApplyMedia: (mediaName: string) => void;
  onUpdateSlide: (updater: (prev: Slide) => Slide) => void;
  onRequestEditPanel: () => void;
}

export default function SlideCanvas({
  slide,
  media,
  selectedMediaName,
  timelinePosition,
  onApplyMedia,
  onUpdateSlide,
  onRequestEditPanel,
}: SlideCanvasProps) {
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const [screenSize, setScreenSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [screenOffset, setScreenOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [textSize, setTextSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    if (!isDraggingText) return;
    const handleMouseUp = () => {
      setIsDraggingText(false);
      dragOffsetRef.current = null;
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isDraggingText]);

  useLayoutEffect(() => {
    if (!screenRef.current || !workspaceRef.current || !textRef.current) return;
    const screenEl = screenRef.current;
    const workspaceEl = workspaceRef.current;
    const textEl = textRef.current;
    const updateSizes = () => {
      const screenRect = screenEl.getBoundingClientRect();
      const workspaceRect = workspaceEl.getBoundingClientRect();
      const textRect = textEl.getBoundingClientRect();
      setScreenSize({ width: screenRect.width, height: screenRect.height });
      setScreenOffset({
        x: screenRect.left - workspaceRect.left,
        y: screenRect.top - workspaceRect.top,
      });
      setTextSize({ width: textRect.width, height: textRect.height });
    };

    updateSizes();

    const observer = new ResizeObserver(() => updateSizes());
    observer.observe(screenEl);
    observer.observe(workspaceEl);
    observer.observe(textEl);

    return () => observer.disconnect();
  }, [
    slide.text,
    slide.fontSize,
    slide.textAnimation,
    slide.resolutionWidth,
    slide.resolutionHeight,
  ]);

  const handleApplyMedia = () => {
    if (!selectedMediaName) return;
    const selected = media.find((item) => item.name === selectedMediaName);
    if (!selected) return;
    onApplyMedia(selectedMediaName);
  };

  return (
    <div
      ref={workspaceRef}
      className="w-full max-w-5xl aspect-video relative flex items-center justify-center cursor-pointer"
      onClick={onRequestEditPanel}
      onMouseMove={(e) => {
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
      >
        {(slide.image || slide.video) && (() => {
          const fileName = slide.image || slide.video;
          const item = media.find((m) => m.name === fileName);
          if (!item) return null;
          return (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-9xl opacity-30">{getFileIcon(item.type)}</span>
            </div>
          );
        })()}
      </div>

      {slide.text && (() => {
        const effect = slide.textAnimation || "none";
        const textPosX = effect === "slide-horizontal"
          ? 50
          : (slide.textPositionX ?? 50);
        const textPosY = effect === "slide-vertical"
          ? 50
          : (slide.textPositionY ?? 50);
        // 애니메이션 설정
        const animationType = slide.textAnimation || "none";
        const baseDuration = slide.duration;
        const delay = slide.textAnimationDelay || 0;
        const repeat = slide.textAnimationRepeat ?? 1;
        const gap = slide.textAnimationGap ?? 0;
        let duration = slide.textAnimationDuration || baseDuration * 0.8;
        let fadeInDuration = slide.textFadeInDuration ?? Math.min(0.6, baseDuration * 0.1);
        let fadeOutDuration = slide.textFadeOutDuration ?? Math.min(0.8, baseDuration * 0.2);

        if (animationType === "fade-in-out") {
          duration = baseDuration;
          const maxFadeIn = Math.max(0, duration - fadeOutDuration);
          fadeInDuration = Math.min(fadeInDuration, maxFadeIn);
          const maxFadeOut = Math.max(0, duration - fadeInDuration);
          fadeOutDuration = Math.min(fadeOutDuration, maxFadeOut);
        } else if (animationType !== "none") {
          if (repeat > 0) {
            const totalGap = Math.max(0, gap) * Math.max(0, repeat - 1);
            const available = Math.max(0.1, baseDuration - totalGap);
            duration = Math.max(0.1, available / repeat);
          } else {
            duration = slide.textAnimationDuration || baseDuration * 0.8;
          }
        }

        const animationState = calculateAnimationState(
          {
            type: animationType,
            duration,
            delay,
            repeat: animationType === "fade-in-out" ? 1 : repeat,
            gap: animationType === "fade-in-out" ? 0 : gap,
            fadeInDuration,
            fadeOutDuration,
          },
          timelinePosition
        );

        const getSlideProgress = () => {
          if (timelinePosition < delay) return 0;
          const elapsed = timelinePosition - delay;
          const cycleDuration = duration + gap;
          const repeatCount = Math.max(0, Math.floor(repeat));
          const totalDuration = repeatCount === 0
            ? Infinity
            : (repeatCount * duration) + ((repeatCount - 1) * gap);
          if (elapsed >= totalDuration) return 1;
          const cycleTime = cycleDuration > 0 ? (elapsed % cycleDuration) : elapsed;
          if (cycleTime > duration) return 1;
          return duration > 0 ? Math.min(cycleTime / duration, 1) : 1;
        };

        const textStyle = getAnimationStyle(animationState);
        const resolutionWidth = slide.resolutionWidth || screenSize.width || 1920;
        const resolutionHeight = slide.resolutionHeight || screenSize.height || 1080;
        const scaleX = resolutionWidth > 0 ? screenSize.width / resolutionWidth : 1;
        const scaleY = resolutionHeight > 0 ? screenSize.height / resolutionHeight : 1;
        const virtualTextWidth = scaleX > 0 ? textSize.width / scaleX : textSize.width;
        const virtualTextHeight = scaleY > 0 ? textSize.height / scaleY : textSize.height;
        const progress = (animationType === "slide-horizontal" || animationType === "slide-vertical")
          ? getSlideProgress()
          : null;
        const slideX = progress !== null && animationType === "slide-horizontal"
          ? (
              (
                -((resolutionWidth + virtualTextWidth) / 2) +
                progress * (resolutionWidth + virtualTextWidth)
              ) * scaleX
            )
          : 0;
        const slideY = progress !== null && animationType === "slide-vertical"
          ? (
              (
                ((resolutionHeight + virtualTextHeight) / 2) -
                progress * (resolutionHeight + virtualTextHeight)
              ) * scaleY
            )
          : 0;

        const transformValue = (animationType === "slide-horizontal" || animationType === "slide-vertical")
          ? `translate(-50%, -50%) translate(${slideX}px, ${slideY}px)`
          : `translate(-50%, -50%) translate(${animationState.translateX}%, ${animationState.translateY}%)`;
        const finalStyle: React.CSSProperties = {
          opacity: textStyle.opacity,
          transform: transformValue,
          color: slide.textColor || "#000000",
          fontSize: `${slide.fontSize || 32}px`,
          fontWeight: "bold",
          left: screenOffset.x + (textPosX / 100) * screenSize.width,
          top: screenOffset.y + (textPosY / 100) * screenSize.height,
        };

        return (
          <div
            ref={textRef}
            className={`absolute select-none whitespace-pre-wrap text-center px-4 py-2 ${
              isDraggingText ? "cursor-grabbing" : "cursor-move"
            }`}
            style={finalStyle}
            onMouseDown={(e) => {
              if (!screenRef.current) return;
              e.preventDefault();
              const rect = screenRef.current.getBoundingClientRect();
              const currentX = (textPosX / 100) * rect.width;
              const currentY = (textPosY / 100) * rect.height;
              dragOffsetRef.current = {
                x: e.clientX - rect.left - currentX,
                y: e.clientY - rect.top - currentY,
              };
              setIsDraggingText(true);
            }}
          >
            {slide.text}
          </div>
        );
      })()}

      {!slide.text && !slide.image && !slide.video && (
        <div className="text-gray-400 text-center">
          <p className="text-lg mb-2">빈 캔버스</p>
          <p className="text-sm">왼쪽에서 미디어를 드래그하거나<br />캔버스를 클릭하여 편집하세요</p>
        </div>
      )}
    </div>
  );
}
