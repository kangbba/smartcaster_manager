import { ProjectSummary } from "@/lib/types";

/**
 * 프로젝트 요약 정보 (목록 페이지용)
 */

export const projectSummaries: ProjectSummary[] = [
  {
    id: 1,
    name: "2026 S/S 신상품 런칭",
    client: "나이키 코리아",
    mediaCount: 5,
    playlistCount: 2,
    totalSize: "92.4 MB",
    status: "active",
    createdAt: "2026-01-20",
    assignedDevices: 4,
  },
  {
    id: 2,
    name: "설 명절 특가 프로모션",
    client: "롯데백화점",
    mediaCount: 4,
    playlistCount: 1,
    totalSize: "68.1 MB",
    status: "active",
    createdAt: "2026-01-18",
    assignedDevices: 2,
  },
];
