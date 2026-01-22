"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";

type MediaFile = {
  id: number;
  name: string;
  type: "video" | "image";
  size: string;
  duration?: string;
  uploadDate: string;
};

type Page = {
  id: string;
  name: string;
  backgroundColor: string;
  text?: string;
  fontSize?: number;
  textColor?: string;
  mediaFileId?: number;
};

type Playlist = {
  id: string;
  name: string;
  template: string;
  pageIds: string[];
  createdAt: string;
};

// Dummy 데이터
const projectData = {
  1: {
    id: 1,
    name: "2026 S/S 신상품 런칭",
    client: "나이키 코리아",
    status: "active",
    createdAt: "2026-01-20",
    media: [
      { id: 1, name: "Nike_SS2026_Hero_60s.mp4", type: "video" as const, size: "85.2 MB", duration: "01:00", uploadDate: "2026-01-20" },
      { id: 2, name: "Nike_SS2026_Hero_30s.mp4", type: "video" as const, size: "42.8 MB", duration: "00:30", uploadDate: "2026-01-20" },
      { id: 3, name: "Nike_SS2026_Product_AirMax.jpg", type: "image" as const, size: "12.5 MB", uploadDate: "2026-01-20" },
      { id: 4, name: "Nike_SS2026_Product_Pegasus.jpg", type: "image" as const, size: "11.8 MB", uploadDate: "2026-01-20" },
      { id: 5, name: "Nike_SS2026_Product_Vomero.jpg", type: "image" as const, size: "10.3 MB", uploadDate: "2026-01-20" },
      { id: 6, name: "Nike_SS2026_Lifestyle_01.jpg", type: "image" as const, size: "15.2 MB", uploadDate: "2026-01-20" },
      { id: 7, name: "Nike_SS2026_Lifestyle_02.jpg", type: "image" as const, size: "14.8 MB", uploadDate: "2026-01-20" },
      { id: 8, name: "Nike_SS2026_Logo_Animation.mp4", type: "video" as const, size: "18.5 MB", duration: "00:10", uploadDate: "2026-01-20" },
    ],
    pages: [
      {
        id: "page_001",
        name: "Hero 영상",
        backgroundColor: "#000000",
        mediaFileId: 1,
      },
      {
        id: "page_002",
        name: "제품 소개",
        backgroundColor: "#FFFFFF",
        text: "NEW ARRIVALS",
        fontSize: 64,
        textColor: "#000000",
        mediaFileId: 3,
      },
      {
        id: "page_003",
        name: "특가 안내",
        backgroundColor: "#1E40AF",
        text: "특가 할인\n\n지금 바로 확인하세요!",
        fontSize: 48,
        textColor: "#FFFFFF",
      },
    ],
    playlists: [
      {
        id: "pl_001",
        name: "메인 매장용 플레이리스트",
        template: "3840x2160 UHD 단일화면",
        pageIds: ["page_001", "page_002", "page_003"],
        createdAt: "2026-01-21",
      },
      {
        id: "pl_002",
        name: "세일 매장용 플레이리스트",
        template: "1080x1920 세로형",
        pageIds: ["page_003", "page_002"],
        createdAt: "2026-01-21",
      },
    ],
  },
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [draggedPlaylistIndex, setDraggedPlaylistIndex] = useState<number | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);

  const { id } = use(params);
  const project = projectData[Number(id) as keyof typeof projectData];

  // 초기화
  useEffect(() => {
    if (project) {
      setPages(project.pages);
      setPlaylists(project.playlists);
    }
  }, [project]);

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
      default: return "📄";
    }
  };

  // 페이지 편집 시작
  const handleEditPage = (page: Page) => {
    setEditingPage({ ...page });
    setSelectedMediaId(null);
  };

  // 새 페이지 생성
  const handleCreatePage = () => {
    const newPage: Page = {
      id: `page_${Date.now()}`,
      name: `페이지 ${pages.length + 1}`,
      backgroundColor: "#FFFFFF",
      text: "",
      fontSize: 32,
      textColor: "#000000",
    };
    setEditingPage(newPage);
  };

  // 페이지 저장
  const handleSavePage = () => {
    if (!editingPage) return;

    const existingIndex = pages.findIndex(p => p.id === editingPage.id);
    if (existingIndex >= 0) {
      // 기존 페이지 수정
      const updated = [...pages];
      updated[existingIndex] = editingPage;
      setPages(updated);
    } else {
      // 새 페이지 추가
      setPages([...pages, editingPage]);
    }
    setEditingPage(null);
  };

  // 페이지 편집 취소
  const handleCancelEditPage = () => {
    setEditingPage(null);
  };

  // 플레이리스트 편집 모달 열기
  const handleOpenPlaylistModal = (playlist: Playlist) => {
    setEditingPlaylist({ ...playlist });
    setSelectedPageIndex(0);
  };

  // 플레이리스트 편집 취소
  const handleCancelEditPlaylist = () => {
    setEditingPlaylist(null);
    setSelectedPageIndex(0);
  };

  // 플레이리스트 편집 내용 적용
  const handleApplyEditPlaylist = () => {
    if (!editingPlaylist) return;
    const updatedPlaylists = playlists.map(pl =>
      pl.id === editingPlaylist.id ? editingPlaylist : pl
    );
    setPlaylists(updatedPlaylists);
    setEditingPlaylist(null);
  };

  // 페이지를 플레이리스트에 추가 (드래그앤드랍)
  const handleDropPageToPlaylist = (pageId: string, targetIndex?: number) => {
    if (!editingPlaylist) return;

    // 이미 존재하는지 확인
    if (editingPlaylist.pageIds.includes(pageId)) return;

    const newPageIds = [...editingPlaylist.pageIds];
    if (targetIndex !== undefined) {
      newPageIds.splice(targetIndex, 0, pageId);
    } else {
      newPageIds.push(pageId);
    }

    setEditingPlaylist({
      ...editingPlaylist,
      pageIds: newPageIds
    });
  };

  // 플레이리스트에서 페이지 제거
  const handleRemovePageFromPlaylist = (index: number) => {
    if (!editingPlaylist) return;
    const newPageIds = editingPlaylist.pageIds.filter((_, i) => i !== index);
    setEditingPlaylist({
      ...editingPlaylist,
      pageIds: newPageIds
    });
    if (selectedPageIndex >= newPageIds.length) {
      setSelectedPageIndex(Math.max(0, newPageIds.length - 1));
    }
  };

  // 플레이리스트 내 순서 변경
  const handleReorderPlaylist = (fromIndex: number, toIndex: number) => {
    if (!editingPlaylist) return;
    const newPageIds = [...editingPlaylist.pageIds];
    const [removed] = newPageIds.splice(fromIndex, 1);
    newPageIds.splice(toIndex, 0, removed);
    setEditingPlaylist({
      ...editingPlaylist,
      pageIds: newPageIds
    });
  };

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.client}</p>
          </div>
        </div>

        {/* 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">페이지 & 플레이리스트</h3>
              <p className="text-sm text-gray-600">
                <strong>페이지</strong>를 클릭하여 배경색, 텍스트, 미디어를 편집하세요.
                <strong>플레이리스트</strong>를 클릭하여 페이지의 배치와 순서를 조정하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2단 레이아웃: 플레이리스트 | 페이지 */}
      <div className="flex gap-4 h-[calc(100vh-300px)]">
        {/* 좌측: 플레이리스트 목록 */}
        <div className="w-1/2 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">플레이리스트 ({playlists.length})</h2>
            <button className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600">
              + 플레이리스트
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {playlists.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                플레이리스트가 없습니다
              </div>
            ) : (
              playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => handleOpenPlaylistModal(playlist)}
                  className="border-2 rounded-lg cursor-pointer transition-all border-gray-200 bg-white hover:border-cyan-400 hover:bg-cyan-50 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📺</span>
                      <div>
                        <h3 className="font-bold text-gray-800">{playlist.name}</h3>
                        <p className="text-xs text-gray-500">{playlist.template}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {playlist.pageIds.length}개
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 우측: 페이지 목록 */}
        <div className="w-1/2 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">페이지 ({pages.length})</h2>
            <button
              onClick={handleCreatePage}
              className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              + 페이지
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {pages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                페이지가 없습니다
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {pages.map((page) => {
                  const media = page.mediaFileId ? project.media.find(m => m.id === page.mediaFileId) : null;

                  return (
                    <div
                      key={page.id}
                      onClick={() => handleEditPage(page)}
                      className="group bg-white rounded-lg border-2 shadow-sm cursor-pointer transition-all hover:shadow-lg border-gray-200 hover:border-green-400 overflow-hidden"
                    >
                      {/* 16:9 미리보기 */}
                      <div
                        className="aspect-video relative flex items-center justify-center"
                        style={{ backgroundColor: page.backgroundColor }}
                      >
                        {/* 미디어 배경 */}
                        {page.mediaFileId && media && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-7xl opacity-20">{getFileIcon(media.type)}</span>
                          </div>
                        )}

                        {/* 텍스트 오버레이 */}
                        {page.text && (
                          <div
                            className="absolute inset-0 flex items-center justify-center p-4 text-center"
                            style={{
                              color: page.textColor || "#000000",
                              fontSize: `${Math.min(page.fontSize || 32, 24)}px`,
                              fontWeight: "bold",
                              lineHeight: "1.2",
                            }}
                          >
                            <div className="line-clamp-4">
                              {page.text}
                            </div>
                          </div>
                        )}

                        {/* 빈 페이지 */}
                        {!page.text && !page.mediaFileId && (
                          <div className="text-gray-300 text-center">
                            <span className="text-6xl">📄</span>
                          </div>
                        )}

                        {/* 호버 오버레이 */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg">
                            <span className="text-sm font-semibold text-gray-800">편집하기</span>
                          </div>
                        </div>
                      </div>

                      {/* 정보 */}
                      <div className="p-3 bg-white border-t">
                        <h3 className="font-bold text-sm text-gray-800 truncate mb-1">{page.name}</h3>
                        {media && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="truncate">{media.name}</span>
                            {media.duration && (
                              <>
                                <span>•</span>
                                <span>{media.duration}</span>
                              </>
                            )}
                          </div>
                        )}
                        {!media && page.text && (
                          <p className="text-xs text-gray-500 truncate">텍스트 페이지</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 페이지 편집 모달 */}
      {editingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                페이지 편집
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelEditPage}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSavePage}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                >
                  저장
                </button>
              </div>
            </div>

            {/* 모달 본문 */}
            <div className="flex-1 flex overflow-hidden">
              {/* 좌측: 미디어 라이브러리 */}
              <div className="w-80 border-r flex flex-col bg-gray-50">
                <div className="bg-white px-4 py-3 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700">미디어</h3>
                    <button className="px-3 py-1 bg-cyan-500 text-white text-xs rounded hover:bg-cyan-600 font-medium">
                      + 가져오기
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="미디어 검색..."
                      className="w-full px-3 py-1.5 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      🔍
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {project.media.map((media) => (
                      <div
                        key={media.id}
                        draggable
                        onDragStart={() => setSelectedMediaId(media.id)}
                        onClick={() => setSelectedMediaId(media.id)}
                        className={`flex flex-col items-center p-3 rounded-lg cursor-move transition-all ${
                          selectedMediaId === media.id
                            ? "bg-blue-100 ring-2 ring-blue-500"
                            : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        <div className="text-5xl mb-2">{getFileIcon(media.type)}</div>
                        <div className="text-xs font-medium text-gray-800 text-center truncate w-full px-1">
                          {media.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{media.size}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 하단: 선택된 미디어 상세정보 */}
                {selectedMediaId && (() => {
                  const selectedMedia = project.media.find(m => m.id === selectedMediaId);
                  if (!selectedMedia) return null;
                  return (
                    <div className="border-t bg-white p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-4xl">{getFileIcon(selectedMedia.type)}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-800 mb-1 break-words">
                            {selectedMedia.name}
                          </h4>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>타입:</span>
                              <span className="font-medium">{selectedMedia.type === "video" ? "동영상" : "이미지"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>크기:</span>
                              <span className="font-medium">{selectedMedia.size}</span>
                            </div>
                            {selectedMedia.duration && (
                              <div className="flex justify-between">
                                <span>재생시간:</span>
                                <span className="font-medium">{selectedMedia.duration}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>업로드:</span>
                              <span className="font-medium">{selectedMedia.uploadDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-center pt-2 border-t">
                        💡 캔버스로 드래그하여 적용하세요
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 중앙: 캔버스 미리보기 */}
              <div className="flex-1 flex flex-col bg-gray-100 items-center justify-center p-8">
                <div
                  className="w-full max-w-4xl aspect-video rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: editingPage.backgroundColor }}
                  onDragOver={(e) => {
                    if (selectedMediaId) {
                      e.preventDefault();
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (selectedMediaId) {
                      setEditingPage({ ...editingPage, mediaFileId: selectedMediaId });
                    }
                  }}
                >
                  {editingPage.mediaFileId && (() => {
                    const media = project.media.find(m => m.id === editingPage.mediaFileId);
                    if (!media) return null;
                    return (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-9xl opacity-30">{getFileIcon(media.type)}</span>
                      </div>
                    );
                  })()}

                  {editingPage.text && (
                    <div
                      className="absolute inset-0 flex items-center justify-center p-8 text-center whitespace-pre-wrap"
                      style={{
                        color: editingPage.textColor || "#000000",
                        fontSize: `${editingPage.fontSize || 32}px`,
                        fontWeight: "bold",
                      }}
                    >
                      {editingPage.text}
                    </div>
                  )}

                  {!editingPage.text && !editingPage.mediaFileId && (
                    <div className="text-gray-400 text-center">
                      <p className="text-lg mb-2">빈 캔버스</p>
                      <p className="text-sm">왼쪽에서 미디어를 선택하거나<br />우측에서 텍스트를 입력하세요</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 우측: 편집 도구 */}
              <div className="w-80 border-l flex flex-col">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-gray-700">편집</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* 페이지 이름 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      페이지 이름
                    </label>
                    <input
                      type="text"
                      value={editingPage.name}
                      onChange={(e) => setEditingPage({ ...editingPage, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  {/* 배경색 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      배경색
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editingPage.backgroundColor}
                        onChange={(e) => setEditingPage({ ...editingPage, backgroundColor: e.target.value })}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingPage.backgroundColor}
                        onChange={(e) => setEditingPage({ ...editingPage, backgroundColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  {/* 텍스트 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      텍스트
                    </label>
                    <textarea
                      value={editingPage.text || ""}
                      onChange={(e) => setEditingPage({ ...editingPage, text: e.target.value })}
                      placeholder="텍스트를 입력하세요..."
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded resize-none"
                    />
                  </div>

                  {/* 텍스트 색상 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      텍스트 색상
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editingPage.textColor || "#000000"}
                        onChange={(e) => setEditingPage({ ...editingPage, textColor: e.target.value })}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingPage.textColor || "#000000"}
                        onChange={(e) => setEditingPage({ ...editingPage, textColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  {/* 폰트 크기 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      폰트 크기: {editingPage.fontSize || 32}px
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="120"
                      value={editingPage.fontSize || 32}
                      onChange={(e) => setEditingPage({ ...editingPage, fontSize: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* 미디어 제거 버튼 */}
                  {editingPage.mediaFileId && (
                    <div>
                      <button
                        onClick={() => setEditingPage({ ...editingPage, mediaFileId: undefined })}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        미디어 제거
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 플레이리스트 편집 모달 (배치만) */}
      {editingPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingPlaylist.name} - 배치
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelEditPlaylist}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleApplyEditPlaylist}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                >
                  적용
                </button>
              </div>
            </div>

            {/* 모달 본문 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 상단: 미리보기 영역 */}
              <div className="h-[40%] bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-6">
                {editingPlaylist.pageIds.length === 0 ? (
                  <div className="text-center text-gray-400">
                    <p className="text-lg mb-2">페이지를 추가하세요</p>
                    <p className="text-sm">아래에서 페이지를 드래그하여<br />하단 플레이리스트에 추가하세요</p>
                  </div>
                ) : (
                  (() => {
                    const currentPageId = editingPlaylist.pageIds[selectedPageIndex];
                    const currentPage = pages.find(p => p.id === currentPageId);

                    if (!currentPage) return <div className="text-gray-400">페이지를 찾을 수 없습니다</div>;

                    return (
                      <div
                        className="w-full max-w-5xl aspect-video rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden"
                        style={{ backgroundColor: currentPage.backgroundColor }}
                      >
                        {currentPage.mediaFileId && (() => {
                          const media = project.media.find(m => m.id === currentPage.mediaFileId);
                          if (!media) return null;
                          return (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-9xl opacity-30">{getFileIcon(media.type)}</span>
                            </div>
                          );
                        })()}

                        {currentPage.text && (
                          <div
                            className="absolute inset-0 flex items-center justify-center p-8 text-center whitespace-pre-wrap"
                            style={{
                              color: currentPage.textColor || "#000000",
                              fontSize: `${currentPage.fontSize || 32}px`,
                              fontWeight: "bold",
                            }}
                          >
                            {currentPage.text}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* 중앙: 페이지 라이브러리 (그리드뷰, 파일 탐색기 느낌) */}
              <div className="flex-1 border-t border-b bg-gray-50 overflow-hidden flex flex-col">
                <div className="bg-white px-4 py-3 border-b">
                  <h3 className="font-semibold text-gray-700">페이지 라이브러리</h3>
                  <p className="text-xs text-gray-500 mt-0.5">드래그하여 하단 플레이리스트에 추가</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-4 gap-3">
                    {pages.map((page) => {
                      const media = page.mediaFileId ? project.media.find(m => m.id === page.mediaFileId) : null;
                      const isUsed = editingPlaylist.pageIds.includes(page.id);

                      return (
                        <div
                          key={page.id}
                          draggable
                          onDragStart={() => setDraggedPageId(page.id)}
                          onDragEnd={() => setDraggedPageId(null)}
                          className={`group bg-white rounded-lg border shadow-sm cursor-move transition-all hover:shadow-md ${
                            isUsed
                              ? "border-gray-300 opacity-40"
                              : "border-gray-200 hover:border-blue-400"
                          }`}
                        >
                          {/* 썸네일 */}
                          <div
                            className="aspect-video rounded-t-lg flex items-center justify-center"
                            style={{ backgroundColor: page.backgroundColor }}
                          >
                            {page.mediaFileId ? (
                              <span className="text-5xl">{getFileIcon(media?.type || "")}</span>
                            ) : page.text ? (
                              <span className="text-5xl">📝</span>
                            ) : (
                              <span className="text-5xl text-gray-300">📄</span>
                            )}
                          </div>

                          {/* 정보 */}
                          <div className="p-3 border-t">
                            <h4 className="font-semibold text-sm text-gray-800 truncate mb-1">{page.name}</h4>
                            {media && (
                              <div className="space-y-0.5">
                                <p className="text-xs text-gray-600 truncate">{media.name}</p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <span>{media.size}</span>
                                  {media.duration && (
                                    <>
                                      <span>•</span>
                                      <span>{media.duration}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                            {page.text && !media && (
                              <p className="text-xs text-gray-500 line-clamp-2">{page.text}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 하단: 플레이리스트 타임라인 (가로 스크롤) */}
              <div className="h-48 bg-white border-t flex flex-col">
                <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">플레이리스트 순서</h3>
                  <span className="text-sm text-gray-500">{editingPlaylist.pageIds.length}개 페이지</span>
                </div>
                <div
                  className="flex-1 overflow-x-auto overflow-y-hidden p-4"
                  onDragOver={(e) => {
                    if (draggedPageId || draggedPlaylistIndex !== null) {
                      e.preventDefault();
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedPageId) {
                      handleDropPageToPlaylist(draggedPageId);
                      setDraggedPageId(null);
                    }
                  }}
                >
                  <div className="flex gap-3 h-full min-w-max">
                    {editingPlaylist.pageIds.length === 0 ? (
                      <div className="flex items-center justify-center min-w-[300px] h-full border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-400 text-sm text-center px-4">
                          페이지를 드래그하여 추가하세요
                        </p>
                      </div>
                    ) : (
                      editingPlaylist.pageIds.map((pageId, index) => {
                        const page = pages.find(p => p.id === pageId);
                        if (!page) return null;

                        const media = page.mediaFileId ? project.media.find(m => m.id === page.mediaFileId) : null;

                        return (
                          <div
                            key={`${pageId}-${index}`}
                            draggable
                            onDragStart={() => setDraggedPlaylistIndex(index)}
                            onDragOver={(e) => {
                              if (draggedPlaylistIndex !== null && draggedPlaylistIndex !== index) {
                                e.preventDefault();
                              }
                              if (draggedPageId) {
                                e.preventDefault();
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (draggedPlaylistIndex !== null && draggedPlaylistIndex !== index) {
                                handleReorderPlaylist(draggedPlaylistIndex, index);
                                setDraggedPlaylistIndex(null);
                              } else if (draggedPageId) {
                                handleDropPageToPlaylist(draggedPageId, index);
                                setDraggedPageId(null);
                              }
                            }}
                            onDragEnd={() => setDraggedPlaylistIndex(null)}
                            onClick={() => setSelectedPageIndex(index)}
                            className={`relative flex-shrink-0 w-40 h-full cursor-move transition-all ${
                              selectedPageIndex === index
                                ? "ring-4 ring-blue-500"
                                : "hover:ring-2 hover:ring-gray-300"
                            }`}
                          >
                            <div className="bg-white border-2 border-gray-200 rounded-lg p-2 h-full flex flex-col">
                              {/* 번호 배지 */}
                              <div className="absolute -top-2 -left-2 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10">
                                {index + 1}
                              </div>

                              {/* 삭제 버튼 */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePageFromPlaylist(index);
                                }}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg z-10"
                              >
                                ✕
                              </button>

                              {/* 썸네일 */}
                              <div
                                className="aspect-video rounded flex items-center justify-center mb-2"
                                style={{ backgroundColor: page.backgroundColor }}
                              >
                                {page.mediaFileId ? (
                                  <span className="text-4xl">{getFileIcon(media?.type || "")}</span>
                                ) : page.text ? (
                                  <span className="text-4xl">📝</span>
                                ) : (
                                  <span className="text-4xl text-gray-300">📄</span>
                                )}
                              </div>

                              {/* 이름 */}
                              <div className="text-xs font-medium text-gray-800 truncate text-center">
                                {page.name}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
