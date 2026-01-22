"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MediaFile = {
  id: number;
  name: string;
  type: "video" | "image" | "text";
  size: string;
  duration?: string;
  uploadDate: string;
};

type Playlist = {
  id: string;
  name: string;
  template: string;
  mediaUsed: number[];
  devices: string[];
  createdAt: string;
};

type Item = MediaFile | Playlist;

// Dummy 데이터
const projectData = {
  1: {
    id: 1,
    name: "ABB 샴푸 캠페인",
    client: "ABB 코스메틱",
    status: "active",
    createdAt: "2026-01-20",
    media: [
      { id: 1, name: "샴푸_광고_30초.mp4", type: "video" as const, size: "24.5 MB", duration: "00:30", uploadDate: "2026-01-20" },
      { id: 2, name: "샴푸_배너_메인.jpg", type: "image" as const, size: "8.3 MB", uploadDate: "2026-01-20" },
      { id: 3, name: "샴푸_배너_서브.jpg", type: "image" as const, size: "6.2 MB", uploadDate: "2026-01-20" },
      { id: 4, name: "프로모션_텍스트.txt", type: "text" as const, size: "1.2 KB", uploadDate: "2026-01-20" },
    ],
    playlists: [
      {
        id: "pl_001",
        name: "샴푸 메인 광고",
        template: "1920x1080 4존",
        mediaUsed: [1, 2, 3],
        devices: ["강남점-3층-A", "강남점-3층-B"],
        createdAt: "2026-01-21",
      },
      {
        id: "pl_002",
        name: "샴푸 서브 광고",
        template: "1080x1920 세로",
        mediaUsed: [1, 3],
        devices: ["홍대점-1층"],
        createdAt: "2026-01-21",
      },
    ],
  },
  2: {
    id: 2,
    name: "신선식품 프로모션",
    client: "홈플러스",
    status: "active",
    createdAt: "2026-01-18",
    media: [
      { id: 5, name: "야채_이미지_1.jpg", type: "image" as const, size: "8.2 MB", uploadDate: "2026-01-18" },
      { id: 6, name: "야채_이미지_2.jpg", type: "image" as const, size: "9.8 MB", uploadDate: "2026-01-18" },
      { id: 7, name: "할인_안내.txt", type: "text" as const, size: "0.5 KB", uploadDate: "2026-01-18" },
    ],
    playlists: [
      {
        id: "pl_003",
        name: "신선식품 메인",
        template: "1920x1080 2존",
        mediaUsed: [5, 6],
        devices: ["강남점-1층-A", "강남점-1층-B"],
        createdAt: "2026-01-19",
      },
    ],
  },
  3: {
    id: 3,
    name: "주말 특가 이벤트",
    client: "자체",
    status: "draft",
    createdAt: "2026-01-15",
    media: [
      { id: 8, name: "특가_영상.mp4", type: "video" as const, size: "32.1 MB", duration: "00:45", uploadDate: "2026-01-15" },
    ],
    playlists: [],
  },
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const project = projectData[Number(params.id) as keyof typeof projectData];

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">프로젝트를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
          >
            프로젝트 목록으로
          </button>
        </div>
      </div>
    );
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video": return "🎥";
      case "image": return "🖼️";
      case "text": return "📝";
      case "playlist": return "📺";
      default: return "📄";
    }
  };

  const isMediaFile = (item: Item): item is MediaFile => {
    return 'type' in item && ['video', 'image', 'text'].includes(item.type);
  };

  const isPlaylist = (item: Item): item is Playlist => {
    return 'template' in item;
  };

  // 모든 항목 합치기
  const allItems: Item[] = [
    ...project.playlists,
    ...project.media,
  ];

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/projects")}
          className="text-cyan-600 hover:text-cyan-700 mb-2 flex items-center gap-1"
        >
          ← 프로젝트 목록
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.client}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600">
              + 파일 업로드
            </button>
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
              + 플레이리스트
            </button>
          </div>
        </div>
      </div>

      {/* 탐색기 레이아웃 */}
      <div className="flex gap-4 h-[calc(100vh-250px)]">
        {/* 좌측: 파일 리스트 */}
        <div className="w-1/2 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">폴더 내용</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* 플레이리스트 섹션 */}
            {project.playlists.length > 0 && (
              <div className="border-b">
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600">
                  플레이리스트 ({project.playlists.length})
                </div>
                {project.playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => setSelectedItem(playlist)}
                    className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedItem && isPlaylist(selectedItem) && selectedItem.id === playlist.id
                        ? "bg-cyan-50 border-l-4 border-cyan-500"
                        : ""
                    }`}
                  >
                    <span className="text-3xl">📺</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{playlist.name}</div>
                      <div className="text-xs text-gray-500">{playlist.template}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 미디어 파일 섹션 */}
            <div>
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600">
                미디어 파일 ({project.media.length})
              </div>
              {project.media.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedItem(file)}
                  className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedItem && isMediaFile(selectedItem) && selectedItem.id === file.id
                      ? "bg-cyan-50 border-l-4 border-cyan-500"
                      : ""
                  }`}
                >
                  <span className="text-3xl">{getFileIcon(file.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">{file.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 상세 정보 */}
        <div className="w-1/2 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">상세 정보</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!selectedItem && (
              <div className="flex items-center justify-center h-full text-gray-400">
                항목을 선택하세요
              </div>
            )}

            {/* 미디어 파일 정보 */}
            {selectedItem && isMediaFile(selectedItem) && (
              <div className="space-y-6">
                {/* 미리보기 */}
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                  <span className="text-7xl">{getFileIcon(selectedItem.type)}</span>
                </div>

                {/* 파일 정보 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{selectedItem.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">타입</span>
                      <span className="font-semibold text-gray-800">{selectedItem.type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">크기</span>
                      <span className="font-semibold text-gray-800">{selectedItem.size}</span>
                    </div>
                    {selectedItem.duration && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">재생시간</span>
                        <span className="font-semibold text-gray-800">{selectedItem.duration}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">업로드일</span>
                      <span className="font-semibold text-gray-800">{selectedItem.uploadDate}</span>
                    </div>
                  </div>
                </div>

                {/* 사용 중인 플레이리스트 */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">사용 중인 플레이리스트</h4>
                  <div className="space-y-2">
                    {project.playlists
                      .filter((pl) => pl.mediaUsed.includes(selectedItem.id))
                      .map((pl) => (
                        <div key={pl.id} className="px-3 py-2 bg-cyan-50 text-cyan-700 rounded text-sm">
                          📺 {pl.name}
                        </div>
                      ))}
                    {!project.playlists.some((pl) => pl.mediaUsed.includes(selectedItem.id)) && (
                      <p className="text-sm text-gray-400">사용 중인 플레이리스트 없음</p>
                    )}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-4 border-t">
                  <button className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600">
                    미리보기
                  </button>
                  <button className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50">
                    삭제
                  </button>
                </div>
              </div>
            )}

            {/* 플레이리스트 정보 */}
            {selectedItem && isPlaylist(selectedItem) && (
              <div className="space-y-6">
                {/* 플레이리스트 아이콘 */}
                <div className="flex items-center justify-center h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                  <span className="text-7xl">📺</span>
                </div>

                {/* 플레이리스트 정보 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{selectedItem.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">템플릿</span>
                      <span className="font-semibold text-gray-800">{selectedItem.template}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">생성일</span>
                      <span className="font-semibold text-gray-800">{selectedItem.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* 사용 미디어 */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">사용 미디어</h4>
                  <div className="space-y-2">
                    {project.media
                      .filter((media) => selectedItem.mediaUsed.includes(media.id))
                      .map((media) => (
                        <div key={media.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded text-sm">
                          <span className="text-xl">{getFileIcon(media.type)}</span>
                          <span className="text-gray-800">{media.name}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 할당된 단말기 */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">송출 중인 단말기</h4>
                  <div className="space-y-2">
                    {selectedItem.devices.length > 0 ? (
                      selectedItem.devices.map((device, idx) => (
                        <div key={idx} className="px-3 py-2 bg-green-50 text-green-700 rounded text-sm">
                          🖥️ {device}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">할당된 단말기 없음</p>
                    )}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-4 border-t">
                  <button className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600">
                    수정
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                    복사
                  </button>
                  <button className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50">
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
