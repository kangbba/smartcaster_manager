/**
 * 텍스트 애니메이션 사양 (Text Animation Specifications)
 *
 * 이 파일은 웹 미리보기와 안드로이드 플레이어가 동일한 애니메이션을 구현하기 위한
 * 명확한 사양을 정의합니다.
 *
 * 모든 애니메이션은 0~1 사이의 progress 값으로 제어됩니다.
 * progress = (currentTime - delay) / duration
 */

import React from "react";

export type TextAnimationType = "none" | "fade-in-out" | "slide-horizontal" | "slide-vertical";

/**
 * 애니메이션 설정
 */
export interface AnimationConfig {
  type: TextAnimationType;
  duration: number; // 초 단위
  delay: number; // 초 단위
  repeat?: number; // 반복 횟수 (1 = 1회, 0 = 무한 반복)
  gap?: number; // 반복 간격 (초 단위)
  fadeInDuration?: number; // 페이드 인 시간 (초 단위)
  fadeOutDuration?: number; // 페이드 아웃 시간 (초 단위)
}

/**
 * 애니메이션 상태
 */
export interface AnimationState {
  opacity: number; // 0~1
  translateX: number; // % 단위 (-100 ~ 100)
  translateY: number; // % 단위 (-100 ~ 100)
}

/**
 * 애니메이션 패턴별 세부 사양
 */
export const ANIMATION_SPECS = {
  /**
   * 패턴 1: none (애니메이션 없음)
   * - 텍스트가 처음부터 끝까지 화면 중앙에 정적으로 표시됨
   */
  none: {
    description: "정적 텍스트 (애니메이션 없음)",
    calculate: (_progress: number, _config?: AnimationConfig): AnimationState => ({
      opacity: 1,
      translateX: 0,
      translateY: 0,
    }),
  },

  /**
   * 패턴 2: fade-in-out (페이드 인-아웃)
   * - 0% ~ 10%: 투명도 0 → 1 (빠른 페이드 인)
   * - 10% ~ 80%: 투명도 1 유지 (완전히 보임)
   * - 80% ~ 100%: 투명도 1 → 0 (페이드 아웃)
   */
  "fade-in-out": {
    description: "페이드 인으로 나타났다가 페이드 아웃으로 사라짐",
    calculate: (progress: number, config?: AnimationConfig): AnimationState => {
      const duration = Math.max(0.001, config?.duration ?? 1);
      const rawFadeIn = Math.max(0, config?.fadeInDuration ?? duration * 0.1);
      const rawFadeOut = Math.max(0, config?.fadeOutDuration ?? duration * 0.2);
      let fadeInRatio = Math.min(rawFadeIn / duration, 1);
      let fadeOutRatio = Math.min(rawFadeOut / duration, 1);
      const totalRatio = fadeInRatio + fadeOutRatio;
      if (totalRatio > 1) {
        fadeInRatio = fadeInRatio / totalRatio;
        fadeOutRatio = fadeOutRatio / totalRatio;
      }

      let opacity = 1;

      if (fadeInRatio > 0 && progress < fadeInRatio) {
        // 페이드 인
        opacity = progress / fadeInRatio;
      } else if (fadeOutRatio > 0 && progress > 1 - fadeOutRatio) {
        // 페이드 아웃
        opacity = (1 - progress) / fadeOutRatio;
      }

      return {
        opacity,
        translateX: 0,
        translateY: 0,
      };
    },
  },

  /**
   * 패턴 3: slide-horizontal (가로 슬라이드)
   * - 0% ~ 100%: 화면 왼쪽 밖(-100%)에서 오른쪽 밖(+100%)으로 이동
   * - 중앙(0%)을 지나는 시점은 50%
   */
  "slide-horizontal": {
    description: "왼쪽에서 오른쪽으로 슬라이드",
    calculate: (progress: number, _config?: AnimationConfig): AnimationState => {
      // -120% (왼쪽 밖) → 0% (중앙) → +120% (오른쪽 밖)
      const translateX = -120 + (progress * 240);

      return {
        opacity: 1,
        translateX,
        translateY: 0,
      };
    },
  },

  /**
   * 패턴 4: slide-vertical (세로 슬라이드)
   * - 0% ~ 100%: 화면 아래쪽 밖(+100%)에서 위쪽 밖(-100%)으로 이동
   * - 중앙(0%)을 지나는 시점은 50%
   */
  "slide-vertical": {
    description: "아래에서 위로 슬라이드",
    calculate: (progress: number, _config?: AnimationConfig): AnimationState => {
      // +120% (아래쪽 밖) → 0% (중앙) → -120% (위쪽 밖)
      const translateY = 120 - (progress * 240);

      return {
        opacity: 1,
        translateX: 0,
        translateY,
      };
    },
  },
} as const;

/**
 * 애니메이션 계산 함수
 *
 * @param config 애니메이션 설정
 * @param currentTime 현재 재생 시간 (초)
 * @returns 애니메이션 상태 (opacity, translateX, translateY)
 */
export function calculateAnimationState(
  config: AnimationConfig,
  currentTime: number
): AnimationState {
  const { type, duration, delay, repeat = 1, gap = 0 } = config;
  const repeatCount = Math.max(0, Math.floor(repeat));
  const repeatGap = Math.max(0, gap);

  // delay 이전에는 애니메이션이 시작되지 않음
  if (currentTime < delay) {
    // fade-in-out의 경우 초기 상태는 투명
    if (type === "fade-in-out") {
      return { opacity: 0, translateX: 0, translateY: 0 };
    }
    // slide 애니메이션의 경우 초기 위치
    if (type === "slide-horizontal") {
      return { opacity: 1, translateX: -120, translateY: 0 };
    }
    if (type === "slide-vertical") {
      return { opacity: 1, translateX: 0, translateY: 120 };
    }
    // none의 경우 항상 보임
    return { opacity: 1, translateX: 0, translateY: 0 };
  }

  const elapsed = currentTime - delay;
  const cycleDuration = duration + repeatGap;
  const totalDuration = repeatCount === 0
    ? Infinity
    : (repeatCount * duration) + ((repeatCount - 1) * repeatGap);

  if (elapsed >= totalDuration) {
    const spec = ANIMATION_SPECS[type];
    return spec.calculate(1, config);
  }

  const cycleTime = cycleDuration > 0 ? (elapsed % cycleDuration) : elapsed;
  if (cycleTime > duration) {
    const spec = ANIMATION_SPECS[type];
    return spec.calculate(1, config);
  }

  // progress 계산 (0~1)
  const progress = duration > 0 ? Math.min(cycleTime / duration, 1) : 1;

  // 애니메이션 타입에 따라 계산
  const spec = ANIMATION_SPECS[type];
  return spec.calculate(progress, config);
}

/**
 * 기본 애니메이션 설정 생성
 *
 * @param type 애니메이션 타입
 * @param slideDuration 슬라이드 전체 재생 시간 (초)
 * @returns 기본 애니메이션 설정
 */
export function getDefaultAnimationConfig(
  type: TextAnimationType,
  slideDuration: number
): AnimationConfig {
  // 기본값: 슬라이드 duration의 80%를 애니메이션 duration으로 사용
  const duration = slideDuration * 0.8;
  const isSlide = type === "slide-horizontal" || type === "slide-vertical";

  return {
    type,
    duration,
    delay: 0,
    repeat: isSlide ? 2 : 1,
    gap: isSlide ? 3 : 0,
    fadeInDuration: Math.min(0.6, slideDuration * 0.1),
    fadeOutDuration: Math.min(0.8, slideDuration * 0.2),
  };
}

/**
 * CSS 스타일 생성
 *
 * @param state 애니메이션 상태
 * @returns React CSSProperties 객체
 */
export function getAnimationStyle(state: AnimationState): React.CSSProperties {
  return {
    opacity: state.opacity,
    transform: `translate(${state.translateX}%, ${state.translateY}%)`,
    transition: "none", // 타임라인 스크러빙을 위해 transition 비활성화
  };
}
