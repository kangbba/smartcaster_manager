import React from "react";
import { AnimationType, ANIMATION_SPECS } from "@/lib/animation-specs";

type AnimationPickerProps = {
  value: AnimationType;
  onChange: (value: AnimationType) => void;
  label?: string;
};

/**
 * 애니메이션 선택 UI 컴포넌트
 * 텍스트와 이미지 모두에 사용 가능한 재사용 가능한 컴포넌트
 */
export function AnimationPicker({ value, onChange, label = "효과" }: AnimationPickerProps) {
  const animations: AnimationType[] = [
    "none",
    "fade-in-out",
    "slide-left",
    "slide-right",
    "slide-up",
    "slide-down",
    "zoom-in",
    "zoom-out",
  ];

  return (
    <div className="flex items-center gap-2">
      {label && <label className="text-xs text-gray-600 min-w-[60px]">{label}:</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AnimationType)}
        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
      >
        {animations.map((type) => (
          <option key={type} value={type}>
            {ANIMATION_SPECS[type]?.description || type}
          </option>
        ))}
      </select>
    </div>
  );
}

type AnimationDetailControlsProps = {
  animationType: AnimationType;
  duration: number;
  delay: number;
  repeat?: number;
  gap?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  onUpdate: (updates: {
    duration?: number;
    delay?: number;
    repeat?: number;
    gap?: number;
    fadeInDuration?: number;
    fadeOutDuration?: number;
  }) => void;
};

/**
 * 애니메이션 세부 설정 컨트롤
 * 애니메이션 타입에 따라 적절한 설정 표시
 */
export function AnimationDetailControls({
  animationType,
  duration,
  delay,
  repeat = 1,
  gap = 0,
  fadeInDuration,
  fadeOutDuration,
  onUpdate,
}: AnimationDetailControlsProps) {
  const isSlide = animationType.startsWith("slide-");
  const isZoom = animationType.startsWith("zoom-");
  const isFade = animationType === "fade-in-out";
  const isNone = animationType === "none";

  if (isNone) {
    return (
      <div className="text-xs text-gray-500 italic">
        애니메이션 효과가 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* 기본 설정: 모든 애니메이션에 공통 */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-600 min-w-[60px]">재생시간:</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
          min="0.1"
          max="60"
          step="0.1"
          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <span className="text-xs text-gray-500">초</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-600 min-w-[60px]">시작지연:</label>
        <input
          type="number"
          value={delay}
          onChange={(e) => onUpdate({ delay: Number(e.target.value) })}
          min="0"
          max="60"
          step="0.1"
          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <span className="text-xs text-gray-500">초</span>
      </div>

      {/* 슬라이드/줌 애니메이션: 반복 설정 */}
      {(isSlide || isZoom) && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 min-w-[60px]">반복횟수:</label>
            <input
              type="number"
              value={repeat}
              onChange={(e) => onUpdate({ repeat: Number(e.target.value) })}
              min="0"
              max="99"
              step="1"
              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <span className="text-xs text-gray-500">(0=무한)</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 min-w-[60px]">반복간격:</label>
            <input
              type="number"
              value={gap}
              onChange={(e) => onUpdate({ gap: Number(e.target.value) })}
              min="0"
              max="60"
              step="0.1"
              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <span className="text-xs text-gray-500">초</span>
          </div>
        </>
      )}

      {/* 페이드 인/아웃 애니메이션: 페이드 시간 설정 */}
      {isFade && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 min-w-[60px]">페이드인:</label>
            <input
              type="number"
              value={fadeInDuration || 0}
              onChange={(e) => onUpdate({ fadeInDuration: Number(e.target.value) })}
              min="0"
              max="10"
              step="0.1"
              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <span className="text-xs text-gray-500">초</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 min-w-[60px]">페이드아웃:</label>
            <input
              type="number"
              value={fadeOutDuration || 0}
              onChange={(e) => onUpdate({ fadeOutDuration: Number(e.target.value) })}
              min="0"
              max="10"
              step="0.1"
              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <span className="text-xs text-gray-500">초</span>
          </div>
        </>
      )}
    </div>
  );
}
