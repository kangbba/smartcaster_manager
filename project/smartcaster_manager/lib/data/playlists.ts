import { Playlist, PlaylistSummary } from "@/lib/types";
import { getAllSlides } from "./projects";
import { formatTotalDuration } from "@/lib/utils/fileIcons";

/**
 * 플레이리스트 더미 데이터
 */

export const allPlaylists: Playlist[] = [
  {
    id: 1,
    name: "명동 매장 주간 광고",
    description: "명동 매장용 주간 광고 플레이리스트",
    slideIds: ["slide_1_1", "slide_2_1"],
    status: "active",
    createdAt: "2026-01-22",
  },
  {
    id: 2,
    name: "강남 매장 설 특집",
    description: "설 명절 특가 프로모션용",
    slideIds: ["slide_2_1", "slide_2_2"],
    status: "active",
    createdAt: "2026-01-20",
  },
];

// 플레이리스트 ID로 플레이리스트 찾기
export function getPlaylistById(id: number): Playlist | undefined {
  return allPlaylists.find((p) => p.id === id);
}

// 플레이리스트 요약 정보 생성 (목록 페이지용)
export function getPlaylistSummaries(): PlaylistSummary[] {
  const allSlides = getAllSlides();

  return allPlaylists.map((playlist) => {
    // 플레이리스트에 포함된 슬라이드들
    const slides = playlist.slideIds
      .map((id) => allSlides.find((s) => s.id === id))
      .filter((s) => s !== undefined);

    // 포함된 프로젝트명 추출 (중복 제거)
    const projectNames = Array.from(
      new Set(slides.map((s) => s.projectName))
    );

    // 총 재생 시간 계산
    const durations = slides.map((s) => s.duration);
    const totalDuration = formatTotalDuration(durations);

    const previewSlides = playlist.slideIds
      .map((id) => allSlides.find((s) => s.id === id))
      .filter((s) => s !== undefined)
      .slice(0, 4)
      .map((slide) => {
        const kind = slide.video
          ? "video"
          : slide.image
            ? "image"
            : slide.text
              ? "text"
              : "empty";
        return {
          id: slide.id,
          name: slide.name,
          kind,
          backgroundColor: slide.backgroundColor,
          text: slide.text,
        };
      });

    // 할당된 단말기 수 (임시로 랜덤 값)
    const assignedDevices = playlist.id === 1 ? 3 : 1;

    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      slideCount: slides.length,
      totalDuration,
      projects: projectNames,
      status: playlist.status,
      createdAt: playlist.createdAt,
      assignedDevices,
      previewSlides,
    };
  });
}
