import { Project, Slide } from "@/lib/types";

/**
 * 프로젝트 더미 데이터
 */

// 프로젝트 1: 나이키 코리아
const project1Slides: Slide[] = [
  {
    id: "slide_1_1",
    name: "나이키 메인 타이틀",
    projectId: 1,
    projectName: "2026 S/S 신상품 런칭",
    backgroundColor: "#000000",
    text: "2026 S/S\n신상품 출시",
    textColor: "#FFFFFF",
    fontSize: 48,
    textAnimation: "fade-in-out",
    textAnimationDuration: 8,
    textAnimationDelay: 0,
    duration: 10,
  },
  {
    id: "slide_1_2",
    name: "제품 이미지",
    projectId: 1,
    projectName: "2026 S/S 신상품 런칭",
    backgroundColor: "#1E3A8A",
    image: "Nike_SS2026_MainImage.jpg",
    duration: 15,
  },
];

// 프로젝트 2: 롯데백화점
const project2Slides: Slide[] = [
  {
    id: "slide_2_1",
    name: "설 인사",
    projectId: 2,
    projectName: "설 명절 특가 프로모션",
    backgroundColor: "#DC2626",
    text: "새해 복 많이 받으세요\n2026년 설 대축제",
    textColor: "#FCD34D",
    fontSize: 44,
    textAnimation: "fade-in-out",
    textAnimationDuration: 6,
    textAnimationDelay: 0,
    duration: 8,
  },
  {
    id: "slide_2_2",
    name: "특가 상품",
    projectId: 2,
    projectName: "설 명절 특가 프로모션",
    backgroundColor: "#FFFFFF",
    image: "LunarNewYear_Sale_Banner.jpg",
    duration: 10,
  },
];

// 전체 프로젝트 데이터
export const allProjects: Project[] = [
  {
    id: 1,
    name: "2026 S/S 신상품 런칭",
    client: "나이키 코리아",
    media: [
      {
        id: 1,
        name: "Nike_SS2026_MainImage.jpg",
        type: "image",
        size: "3.2 MB",
        uploadDate: "2026-01-20",
      },
      {
        id: 2,
        name: "Nike_SS2026_Hero_30s.mp4",
        type: "video",
        size: "42.8 MB",
        durationSeconds: 30,
        uploadDate: "2026-01-20",
      },
    ],
    slides: project1Slides,
    mediaCount: 2,
    status: "active",
    createdAt: "2026-01-20",
    assignedDevices: 4,
  },
  {
    id: 2,
    name: "설 명절 특가 프로모션",
    client: "롯데백화점",
    media: [
      {
        id: 20,
        name: "LunarNewYear_Sale_Banner.jpg",
        type: "image",
        size: "6.4 MB",
        uploadDate: "2026-01-18",
      },
    ],
    slides: project2Slides,
    mediaCount: 1,
    status: "active",
    createdAt: "2026-01-18",
    assignedDevices: 2,
  },
];

// 프로젝트 ID로 프로젝트 찾기
export function getProjectById(id: number): Project | undefined {
  return allProjects.find((p) => p.id === id);
}

// 모든 슬라이드를 플랫 배열로 (플레이리스트 편집용)
export function getAllSlides(): Slide[] {
  return allProjects.flatMap((project) => project.slides);
}

// 슬라이드 ID로 슬라이드 찾기
export function getSlideById(slideId: string): Slide | undefined {
  return getAllSlides().find((s) => s.id === slideId);
}
