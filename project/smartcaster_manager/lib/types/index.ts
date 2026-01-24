/**
 * 공통 타입 정의
 * 모든 데이터 모델의 타입을 중앙에서 관리
 */

// ============================================
// Media (미디어 파일)
// ============================================
export interface MediaFile {
  id: number;
  name: string;
  type: "video" | "image";
  size: string;
  durationSeconds?: number; // 동영상의 경우 (초 단위)
  uploadDate: string;
}

// ============================================
// Slide (슬라이드)
// ============================================
// 슬라이드는 조합식 데이터 구조
// - 영상만: video만 할당, 나머지 undefined
// - 사진만: image만 할당, 나머지 undefined
// - 텍스트만: text, textColor, fontSize 할당, 나머지 undefined
// - 사진 + 텍스트: image, text, textColor, fontSize 모두 할당
//
// 텍스트 슬라이딩 이펙트 패턴:
// - "none": 애니메이션 없음 (정적)
// - "fade-in-out": 빠른 페이드인 → 유지 → 페이드아웃
// - "slide-horizontal": 왼쪽에서 오른쪽으로 슬라이드
// - "slide-vertical": 아래에서 위로 슬라이드
export interface Slide {
  id: string;
  name: string;
  projectId: number; // 어느 프로젝트에 속한 슬라이드인지
  projectName: string; // 프로젝트 이름 (플레이리스트에서 표시용)
  backgroundColor: string; // 배경색 (항상 필요)

  // 미디어 (파일명으로 참조)
  image?: string; // 이미지 파일명 (예: "Nike_SS2026_MainImage.jpg")
  video?: string; // 영상 파일명 (예: "Nike_SS2026_Hero_30s.mp4")

  // 텍스트
  text?: string; // 텍스트 내용
  textColor?: string; // 텍스트 색상
  fontSize?: number; // 폰트 크기
  textAnimation?: "none" | "fade-in-out" | "slide-horizontal" | "slide-vertical"; // 텍스트 슬라이딩 이펙트
  textAnimationDuration?: number; // 애니메이션 재생 시간 (초 단위, 기본: duration * 0.8)
  textAnimationDelay?: number; // 애니메이션 시작 지연 (초 단위, 기본: 0)
  textAnimationRepeat?: number; // 반복 횟수 (1 = 1회, 0 = 무한 반복, 기본값: 1)
  textAnimationGap?: number; // 반복 간격 (초 단위, 기본값: 0)
  textFadeInDuration?: number; // 페이드 인 시간 (초 단위, fade-in-out 전용)
  textFadeOutDuration?: number; // 페이드 아웃 시간 (초 단위, fade-in-out 전용)
  textPositionX?: number; // 텍스트 위치 X (0~100, %)
  textPositionY?: number; // 텍스트 위치 Y (0~100, %)
  resolutionWidth?: number; // 슬라이드 해상도 가로 (px)
  resolutionHeight?: number; // 슬라이드 해상도 세로 (px)

  duration: number; // 재생 시간 (초 단위)
}

// ============================================
// Playlist (플레이리스트)
// ============================================
export interface Playlist {
  id: number;
  name: string;
  description: string;
  slideIds: string[]; // 슬라이드 ID 배열 (순서 보장)
  status: "active" | "draft";
  createdAt: string;
}

// ============================================
// Project (프로젝트)
// ============================================
export interface Project {
  id: number;
  name: string;
  client: string;
  media: MediaFile[];
  slides: Slide[];
  mediaCount: number;
  status: "active" | "draft";
  createdAt: string;
  assignedDevices: number; // 할당된 단말기 수
}

// ============================================
// 플레이리스트 요약 정보 (목록 페이지용)
// ============================================
export interface PlaylistSummary {
  id: number;
  name: string;
  description: string;
  slideCount: number;
  totalDuration: string;
  projects: string[]; // 포함된 프로젝트명 배열
  status: "active" | "draft";
  createdAt: string;
  assignedDevices: number;
  previewSlides: {
    id: string;
    name: string;
    kind: "text" | "image" | "video" | "empty";
    backgroundColor: string;
    text?: string;
  }[];
}

// ============================================
// 프로젝트 요약 정보 (목록 페이지용)
// ============================================
export interface ProjectSummary {
  id: number;
  name: string;
  client: string;
  mediaCount: number;
  playlistCount: number;
  totalSize: string;
  status: "active" | "draft";
  createdAt: string;
  assignedDevices: number;
}

// ============================================
// Device (단말기)
// ============================================
export interface Device {
  id: string;
  name: string;
  memberId: number;
  group: string;
  status: "online" | "offline";
  lastSeen: string;
  model?: string;
  resolution?: string;
  registeredDate?: string;
}

// ============================================
// Member (회원)
// ============================================
export interface Member {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  approvedDate: string;
  lastLoginDate: string;
  status: "active" | "inactive";
}
