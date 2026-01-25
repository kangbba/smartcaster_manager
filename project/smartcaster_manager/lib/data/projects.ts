import { Project, Slide } from "@/lib/types";
import { ProjectSummary } from "@/lib/types";

/**
 * 프로젝트 더미 데이터
 */

export const allProjects: Project[] = [];

// 프로젝트 ID로 프로젝트 찾기
export function getProjectById(id: string): Project | undefined {
  return allProjects.find((p) => p.id === id);
}

// 프로젝트 요약 정보 생성 (목록 페이지용)
export function getProjectSummaries(): ProjectSummary[] {
  return allProjects.map((project) => ({
    id: project.id,
    name: project.name,
    client: project.client,
    mediaCount: project.mediaCount,
    playlistCount: 0,
    totalSize: project.media.reduce((sum, media) => {
      const size = Number(media.size.replace(" MB", ""));
      return Number.isNaN(size) ? sum : sum + size;
    }, 0).toFixed(1) + " MB",
    status: project.status,
    createdAt: project.createdAt,
    assignedDevices: project.assignedDevices,
  }));
}

// 모든 슬라이드를 플랫 배열로 (플레이리스트 편집용)
export function getAllSlides(): Slide[] {
  return allProjects.flatMap((project) => project.slides);
}

// 슬라이드 ID로 슬라이드 찾기
export function getSlideById(slideId: string): Slide | undefined {
  return getAllSlides().find((s) => s.id === slideId);
}
