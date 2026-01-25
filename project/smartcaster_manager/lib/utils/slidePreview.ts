import type { Slide } from "@/lib/types";
import { calculateAnimationState, getAnimationStyle } from "@/lib/animation-specs";

export const getTextPositionStyle = (slide: Slide) => ({
  left: `${slide.textPositionX ?? 50}%`,
  top: `${slide.textPositionY ?? 50}%`,
  transform: "translate(-50%, -50%)",
});

export const getScaledFontSize = (slide: Slide, containerWidth: number) => {
  const baseWidth = slide.resolutionWidth || 1920;
  const scale = baseWidth > 0 ? containerWidth / baseWidth : 1;
  const fontSize = (slide.fontSize || 32) * scale;
  return Math.max(8, Math.round(fontSize));
};

export const getMediaGeometry = (
  slide: Slide,
  containerW: number,
  containerH: number,
  mediaW: number,
  mediaH: number
) => {
  const scaleX = slide.mediaScaleX ?? 1;
  const scaleY = slide.mediaScaleY ?? 1;
  const offsetX = ((slide.mediaOffsetX ?? 0) / 100) * containerW;
  const offsetY = ((slide.mediaOffsetY ?? 0) / 100) * containerH;
  const baseScale = mediaW > 0 && mediaH > 0
    ? Math.max(containerW / mediaW, containerH / mediaH)
    : 1;
  const baseWidth = mediaW > 0 ? mediaW * baseScale : containerW;
  const baseHeight = mediaH > 0 ? mediaH * baseScale : containerH;
  return {
    baseWidth,
    baseHeight,
    scaleX,
    scaleY,
    offsetX,
    offsetY,
    actualWidth: baseWidth * scaleX,
    actualHeight: baseHeight * scaleY,
  };
};

export const getMediaRenderStyle = (
  slide: Slide,
  containerW: number,
  containerH: number,
  mediaW: number,
  mediaH: number,
  timelinePosition: number = 0
) => {
  const geometry = getMediaGeometry(slide, containerW, containerH, mediaW, mediaH);

  // 미디어 애니메이션 설정
  const animationType = slide.mediaAnimation || "none";
  const baseDuration = slide.duration;
  const delay = slide.mediaAnimationDelay || 0;
  const repeat = slide.mediaAnimationRepeat ?? 1;
  const gap = slide.mediaAnimationGap ?? 0;
  let duration = slide.mediaAnimationDuration || baseDuration * 0.8;
  let fadeInDuration = slide.mediaFadeInDuration ?? Math.min(0.6, baseDuration * 0.1);
  let fadeOutDuration = slide.mediaFadeOutDuration ?? Math.min(0.8, baseDuration * 0.2);

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
      duration = slide.mediaAnimationDuration || baseDuration * 0.8;
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

  const transformValue = `translate(-50%, -50%) translate(${geometry.offsetX}px, ${geometry.offsetY}px) translate(${animationState.translateX}%, ${animationState.translateY}%) scale(${geometry.scaleX * animationState.scale}, ${geometry.scaleY * animationState.scale})`;

  return {
    geometry,
    style: {
      width: `${geometry.baseWidth}px`,
      height: `${geometry.baseHeight}px`,
      left: "50%",
      top: "50%",
      transform: transformValue,
      transformOrigin: "center",
      position: "absolute",
      opacity: animationState.opacity,
    } as const,
  };
};

type TextRenderInput = {
  slide: Slide;
  timelinePosition: number;
  screenSize: { width: number; height: number };
  screenOffset?: { x: number; y: number };
  textSize: { width: number; height: number };
};

export const getTextRenderStyle = ({
  slide,
  timelinePosition,
  screenSize,
  screenOffset = { x: 0, y: 0 },
  textSize,
}: TextRenderInput) => {
  const effect = slide.textAnimation || "none";
  const textPosX = effect === "slide-horizontal" ? 50 : (slide.textPositionX ?? 50);
  const textPosY = effect === "slide-vertical" ? 50 : (slide.textPositionY ?? 50);
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

  // fontSize 스케일링: 원본 fontSize를 화면 크기에 맞게 조정
  const baseFontSize = slide.fontSize || 32;
  const fontSizePx = Math.max(8, Math.round(baseFontSize * scaleX));

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

  return {
    textPosX,
    textPosY,
    style: {
      opacity: textStyle.opacity,
      transform: transformValue,
      color: slide.textColor || "#000000",
      fontSize: `${fontSizePx}px`,
      fontWeight: "bold",
      left: screenOffset.x + (textPosX / 100) * screenSize.width,
      top: screenOffset.y + (textPosY / 100) * screenSize.height,
    } as const,
  };
};
