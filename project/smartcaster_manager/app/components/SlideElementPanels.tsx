import React from "react";
import { Slide } from "@/lib/types";
import { AnimationPicker, AnimationDetailControls } from "./AnimationPicker";
import { AnimationType, getDefaultAnimationConfig } from "@/lib/animation-specs";

export type ElementType = "background" | "image" | "text" | "audio" | null;

export type ElementSelection = {
  type: ElementType;
  element?: unknown;
};

type BackgroundPanelProps = {
  slide: Slide;
  onUpdate: (updates: Partial<Slide>) => void;
};

export function BackgroundPanel({ slide, onUpdate }: BackgroundPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-sm">배경 설정</h3>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          배경 색상
        </label>
        <input
          type="color"
          value={slide.backgroundColor || "#000000"}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          해상도
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">너비</label>
            <input
              type="number"
              value={slide.resolutionWidth || 1920}
              onChange={(e) => onUpdate({ resolutionWidth: parseInt(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">높이</label>
            <input
              type="number"
              value={slide.resolutionHeight || 1080}
              onChange={(e) => onUpdate({ resolutionHeight: parseInt(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type ImagePanelProps = {
  slide: Slide;
  onUpdate: (updates: Partial<Slide>) => void;
};

export function ImagePanel({ slide, onUpdate }: ImagePanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-sm">이미지/비디오 설정</h3>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          미디어: {slide.image || slide.video || "없음"}
        </label>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          크기 조정
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">가로 배율</label>
            <input
              type="number"
              step="0.1"
              value={slide.mediaScaleX || 1}
              onChange={(e) => onUpdate({ mediaScaleX: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">세로 배율</label>
            <input
              type="number"
              step="0.1"
              value={slide.mediaScaleY || 1}
              onChange={(e) => onUpdate({ mediaScaleY: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          위치 조정
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">X 오프셋</label>
            <input
              type="number"
              step="10"
              value={slide.mediaOffsetX || 0}
              onChange={(e) => onUpdate({ mediaOffsetX: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Y 오프셋</label>
            <input
              type="number"
              step="10"
              value={slide.mediaOffsetY || 0}
              onChange={(e) => onUpdate({ mediaOffsetY: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-800 text-sm mb-3">애니메이션 효과</h4>

        <AnimationPicker
          value={(slide.mediaAnimation as AnimationType) || "none"}
          onChange={(value) => {
            const config = getDefaultAnimationConfig(value, slide.duration);
            onUpdate({
              mediaAnimation: value,
              mediaAnimationDuration: config.duration,
              mediaAnimationDelay: config.delay,
              mediaAnimationRepeat: config.repeat,
              mediaAnimationGap: config.gap,
              mediaFadeInDuration: config.fadeInDuration,
              mediaFadeOutDuration: config.fadeOutDuration,
            });
          }}
        />

        <div className="mt-3">
          <AnimationDetailControls
            animationType={(slide.mediaAnimation as AnimationType) || "none"}
            duration={slide.mediaAnimationDuration || slide.duration * 0.8}
            delay={slide.mediaAnimationDelay || 0}
            repeat={slide.mediaAnimationRepeat}
            gap={slide.mediaAnimationGap}
            fadeInDuration={slide.mediaFadeInDuration}
            fadeOutDuration={slide.mediaFadeOutDuration}
            onUpdate={(updates) => {
              const mappedUpdates: Partial<Slide> = {};
              if (updates.duration !== undefined) mappedUpdates.mediaAnimationDuration = updates.duration;
              if (updates.delay !== undefined) mappedUpdates.mediaAnimationDelay = updates.delay;
              if (updates.repeat !== undefined) mappedUpdates.mediaAnimationRepeat = updates.repeat;
              if (updates.gap !== undefined) mappedUpdates.mediaAnimationGap = updates.gap;
              if (updates.fadeInDuration !== undefined) mappedUpdates.mediaFadeInDuration = updates.fadeInDuration;
              if (updates.fadeOutDuration !== undefined) mappedUpdates.mediaFadeOutDuration = updates.fadeOutDuration;
              onUpdate(mappedUpdates);
            }}
          />
        </div>
      </div>
    </div>
  );
}

type TextPanelProps = {
  slide: Slide;
  onUpdate: (updates: Partial<Slide>) => void;
};

export function TextPanel({ slide, onUpdate }: TextPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-sm">텍스트 설정</h3>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          텍스트 내용
        </label>
        <textarea
          value={slide.text || ""}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="텍스트를 입력하세요"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          글꼴 크기
        </label>
        <input
          type="range"
          min="12"
          max="120"
          value={slide.fontSize || 32}
          onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-600 text-right">{slide.fontSize || 32}px</div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          텍스트 색상
        </label>
        <input
          type="color"
          value={slide.textColor || "#ffffff"}
          onChange={(e) => onUpdate({ textColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          위치 조정
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">X 위치 (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={slide.textPositionX ?? 50}
              onChange={(e) => onUpdate({ textPositionX: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Y 위치 (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={slide.textPositionY ?? 50}
              onChange={(e) => onUpdate({ textPositionY: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-800 text-sm mb-3">애니메이션 효과</h4>

        <AnimationPicker
          value={(slide.textAnimation as AnimationType) || "none"}
          onChange={(value) => {
            const config = getDefaultAnimationConfig(value, slide.duration);
            onUpdate({
              textAnimation: value,
              textAnimationDuration: config.duration,
              textAnimationDelay: config.delay,
              textAnimationRepeat: config.repeat,
              textAnimationGap: config.gap,
              textFadeInDuration: config.fadeInDuration,
              textFadeOutDuration: config.fadeOutDuration,
            });
          }}
        />

        <div className="mt-3">
          <AnimationDetailControls
            animationType={(slide.textAnimation as AnimationType) || "none"}
            duration={slide.textAnimationDuration || slide.duration * 0.8}
            delay={slide.textAnimationDelay || 0}
            repeat={slide.textAnimationRepeat}
            gap={slide.textAnimationGap}
            fadeInDuration={slide.textFadeInDuration}
            fadeOutDuration={slide.textFadeOutDuration}
            onUpdate={(updates) => {
              const mappedUpdates: Partial<Slide> = {};
              if (updates.duration !== undefined) mappedUpdates.textAnimationDuration = updates.duration;
              if (updates.delay !== undefined) mappedUpdates.textAnimationDelay = updates.delay;
              if (updates.repeat !== undefined) mappedUpdates.textAnimationRepeat = updates.repeat;
              if (updates.gap !== undefined) mappedUpdates.textAnimationGap = updates.gap;
              if (updates.fadeInDuration !== undefined) mappedUpdates.textFadeInDuration = updates.fadeInDuration;
              if (updates.fadeOutDuration !== undefined) mappedUpdates.textFadeOutDuration = updates.fadeOutDuration;
              onUpdate(mappedUpdates);
            }}
          />
        </div>
      </div>
    </div>
  );
}

type AudioPanelProps = {
  slide: Slide;
  onUpdate: (updates: Partial<Slide>) => void;
};

export function AudioPanel({ slide }: AudioPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-sm">오디오 설정</h3>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          오디오: {slide.audio || "없음"}
        </label>
        <p className="text-xs text-gray-500 mt-2">
          오디오 파일이 슬라이드와 함께 재생됩니다.
        </p>
      </div>
    </div>
  );
}
