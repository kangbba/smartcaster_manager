/**
 * Application Configuration
 * 모든 설정 상수를 중앙에서 관리
 */

/**
 * 슬라이드 기본 설정
 */
export const SLIDE_DEFAULTS = {
  /** 기본 해상도 - 가로 (px) */
  RESOLUTION_WIDTH: 1920,
  /** 기본 해상도 - 세로 (px) */
  RESOLUTION_HEIGHT: 1080,
  /** 기본 재생 시간 (초) */
  DURATION: 10,
  /** 기본 폰트 크기 (px) */
  FONT_SIZE: 32,
  /** 기본 배경색 */
  BACKGROUND_COLOR: "#000000",
  /** 기본 텍스트 색상 */
  TEXT_COLOR: "#000000",
  /** 기본 텍스트 위치 X (%) */
  TEXT_POSITION_X: 50,
  /** 기본 텍스트 위치 Y (%) */
  TEXT_POSITION_Y: 50,
  /** 기본 미디어 스케일 */
  MEDIA_SCALE: 1,
  /** 기본 미디어 오프셋 */
  MEDIA_OFFSET: 0,
} as const;

/**
 * 애니메이션 기본 설정
 */
export const ANIMATION_DEFAULTS = {
  /** 페이드 인-아웃 애니메이션 */
  "fade-in-out": {
    /** 페이드 인 시간 (초) */
    fadeInDuration: 0.6,
    /** 페이드 아웃 시간 (초) */
    fadeOutDuration: 0.8,
  },
  /** 가로 스크롤 애니메이션 */
  "slide-horizontal": {
    /** 재생 시간 비율 (슬라이드 전체 시간의 80%) */
    durationRatio: 0.8,
    /** 기본 반복 횟수 */
    repeat: 2,
    /** 반복 간격 (초) */
    gap: 3,
  },
  /** 세로 스크롤 애니메이션 */
  "slide-vertical": {
    /** 재생 시간 비율 (슬라이드 전체 시간의 80%) */
    durationRatio: 0.8,
    /** 기본 반복 횟수 */
    repeat: 2,
    /** 반복 간격 (초) */
    gap: 3,
  },
  /** 정적 텍스트 (애니메이션 없음) */
  none: {
    /** 최소 반복 시간 (초) */
    minLoopDuration: 0.1,
  },
} as const;

/**
 * 타임라인 재생 설정
 */
export const TIMELINE_PLAYBACK = {
  /** 재생 틱 간격 (ms) */
  TICK_INTERVAL_MS: 33,
  /** 최소 재생 시간 (초) */
  MIN_DURATION: 1,
  /** 최대 재생 시간 (초) */
  MAX_DURATION: 60,
} as const;

/**
 * 미디어 업로드 설정
 */
export const MEDIA_UPLOAD = {
  /** 지원하는 이미지 타입 */
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  /** 지원하는 비디오 타입 */
  SUPPORTED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/quicktime"],
  /** 지원하는 오디오 타입 */
  SUPPORTED_AUDIO_TYPES: ["audio/mpeg", "audio/wav", "audio/ogg"],
  /** 최대 파일 크기 (bytes) - 100MB */
  MAX_FILE_SIZE: 100 * 1024 * 1024,
} as const;

/**
 * UI 설정
 */
export const UI_CONFIG = {
  /** 슬라이드 그리드 - 기본 컬럼 수 */
  SLIDE_GRID_COLS: 3,
  /** 슬라이드 그리드 - XL 화면 컬럼 수 */
  SLIDE_GRID_COLS_XL: 4,
  /** 미디어 썸네일 크기 */
  MEDIA_THUMBNAIL_SIZE: {
    width: 120,
    height: 120,
  },
} as const;

/**
 * 폰트 크기 범위
 */
export const FONT_SIZE_RANGE = {
  MIN: 16,
  MAX: 120,
} as const;
