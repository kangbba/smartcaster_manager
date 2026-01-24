"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Playlist, Slide } from "@/lib/types";
import { allProjects, getAllSlides } from "@/lib/data/projects";
import { getPlaylistById } from "@/lib/data/playlists";
import { getFileIcon, formatTotalDuration } from "@/lib/utils/fileIcons";
import SlideLibraryPanel from "@/app/components/SlideLibraryPanel";

// 더미 플레이리스트 데이터 (기본값)
const defaultPlaylist: Playlist = {
  id: 1,
  name: "명동 매장 주간 광고",
  description: "명동 매장용 주간 광고 플레이리스트",
  slideIds: ["slide_1_1", "slide_2_1", "slide_3_1"],
  status: "active",
  createdAt: "2026-01-22",
};

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = Number(params.id);

  // 상태 관리
  const [playlist, setPlaylist] = useState<Playlist>(
    getPlaylistById(playlistId) || defaultPlaylist
  );
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [draggedSlideId, setDraggedSlideId] = useState<string | null>(null);
  const [draggedPlaylistIndex, setDraggedPlaylistIndex] = useState<number | null>(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<number | null>(null);
  const [playlistHeight, setPlaylistHeight] = useState<number>(384); // 기본값 384px (h-96)
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // 모든 슬라이드 가져오기
  const allSlides = getAllSlides();

  // 필터링된 슬라이드
  const filteredSlides = selectedProjectFilter
    ? allSlides.filter((slide) => slide.projectId === selectedProjectFilter)
    : allSlides;

  // 핸들러 함수들
  const handleDropSlideToPlaylist = (slideId: string, insertIndex?: number) => {
    // 이미 포함된 슬라이드는 추가하지 않음
    if (playlist.slideIds.includes(slideId)) {
      return;
    }

    const newSlideIds = [...playlist.slideIds];
    if (insertIndex !== undefined) {
      newSlideIds.splice(insertIndex, 0, slideId);
    } else {
      newSlideIds.push(slideId);
    }

    setPlaylist({ ...playlist, slideIds: newSlideIds });
  };

  const handleRemoveSlideFromPlaylist = (index: number) => {
    const newSlideIds = playlist.slideIds.filter((_, i) => i !== index);
    setPlaylist({ ...playlist, slideIds: newSlideIds });

    // 선택된 인덱스 조정
    if (selectedSlideIndex >= newSlideIds.length) {
      setSelectedSlideIndex(Math.max(0, newSlideIds.length - 1));
    }
  };

  const handleReorderPlaylist = (fromIndex: number, toIndex: number) => {
    const newSlideIds = [...playlist.slideIds];
    const [removed] = newSlideIds.splice(fromIndex, 1);
    newSlideIds.splice(toIndex, 0, removed);
    setPlaylist({ ...playlist, slideIds: newSlideIds });

    // 선택된 인덱스 업데이트
    if (selectedSlideIndex === fromIndex) {
      setSelectedSlideIndex(toIndex);
    }
  };

  const handleSavePlaylist = () => {
    // TODO: API 호출로 플레이리스트 저장
    console.log("플레이리스트 저장:", playlist);
    router.push("/dashboard/playlists");
  };

  const handleCancel = () => {
    router.push("/dashboard/playlists");
  };

  // 리사이즈 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    // 뷰포트 하단에서 마우스까지의 거리를 계산
    const newHeight = window.innerHeight - e.clientY;
    // 최소 200px, 최대 뷰포트의 70%까지
    const clampedHeight = Math.max(200, Math.min(newHeight, window.innerHeight * 0.7));
    setPlaylistHeight(clampedHeight);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // 리사이즈 이벤트 리스너 등록
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // 현재 선택된 슬라이드 가져오기
  const getCurrentSlide = (): Slide | null => {
    if (playlist.slideIds.length === 0) return null;
    const currentSlideId = playlist.slideIds[selectedSlideIndex];
    return allSlides.find((s) => s.id === currentSlideId) || null;
  };

  const currentSlide = getCurrentSlide();

  // 슬라이드의 미디어 파일 가져오기
  const getMediaForSlide = (slide: Slide) => {
    const fileName = slide.image || slide.video;
    if (!fileName) return null;
    const project = allProjects.find((p) => p.id === slide.projectId);
    return project?.media.find((m) => m.name === fileName);
  };

  // 총 재생 시간 계산
  const getTotalDuration = () => {
    const durations = playlist.slideIds
      .map((slideId) => allSlides.find((s) => s.id === slideId))
      .filter((s) => s !== undefined)
      .map((s) => s.duration);

    return formatTotalDuration(durations);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{playlist.name}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {playlist.description} • {playlist.slideIds.length}개 슬라이드 • {getTotalDuration()}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSavePlaylist}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
          >
            저장
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠: Canva 스타일 레이아웃 */}
      <div className="flex-1 flex overflow-hidden">
        <SlideLibraryPanel
          projects={allProjects}
          slides={filteredSlides}
          selectedProjectId={selectedProjectFilter}
          onSelectProject={setSelectedProjectFilter}
          onDragStart={(slideId) => setDraggedSlideId(slideId)}
          onDragEnd={() => setDraggedSlideId(null)}
          isUsed={(slideId) => playlist.slideIds.includes(slideId)}
        />

        {/* 중앙 + 하단: 미리보기 + 플레이리스트 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 상단: 미리보기 영역 */}
          <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-8 overflow-hidden">
            {playlist.slideIds.length === 0 ? (
              <div className="text-center text-gray-400">
                <p className="text-lg mb-2">플레이리스트가 비어있습니다</p>
                <p className="text-sm">왼쪽에서 슬라이드를 추가하세요</p>
              </div>
            ) : currentSlide ? (
              <div className="w-full max-w-6xl">
                {/* 슬라이드 정보 */}
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    <span className="text-white font-medium">{currentSlide.name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-cyan-400 text-sm">{currentSlide.projectName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400 text-sm">{currentSlide.duration}초</span>
                  </div>
                </div>

                {/* 슬라이드 미리보기 */}
                <div
                  className="aspect-video rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: currentSlide.backgroundColor }}
                >
                  {(currentSlide.image || currentSlide.video) && (() => {
                    const media = getMediaForSlide(currentSlide);
                    if (!media) return null;
                    return (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-9xl opacity-30">{getFileIcon(media.type)}</span>
                      </div>
                    );
                  })()}

                  {currentSlide.text && (
                    <div
                      className="absolute inset-0 flex items-center justify-center p-8 text-center whitespace-pre-wrap"
                      style={{
                        color: currentSlide.textColor || "#000000",
                        fontSize: `${currentSlide.fontSize || 32}px`,
                        fontWeight: "bold",
                      }}
                    >
                      {currentSlide.text}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-400">슬라이드를 찾을 수 없습니다</div>
            )}
          </div>

          {/* 리사이즈 핸들 */}
          <div
            onMouseDown={handleMouseDown}
            className={`h-2 bg-gray-200 hover:bg-blue-400 cursor-ns-resize flex items-center justify-center transition-colors ${
              isResizing ? "bg-blue-500" : ""
            }`}
          >
            <div className="w-12 h-1 bg-gray-400 rounded-full"></div>
          </div>

          {/* 하단: 플레이리스트 (가로 스크롤) */}
          <div
            className="bg-gray-50 border-t flex flex-col"
            style={{ height: `${playlistHeight}px` }}
          >
            {/* 헤더 */}
            <div className="px-6 py-3 border-b bg-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">플레이리스트</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {playlist.slideIds.length}개 슬라이드 • {getTotalDuration()}
                </p>
              </div>
            </div>

            {/* 플레이리스트 horizontal 스크롤 */}
            <div
              className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4"
              onDragOver={(e) => {
                if (draggedSlideId || draggedPlaylistIndex !== null) {
                  e.preventDefault();
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedSlideId) {
                  handleDropSlideToPlaylist(draggedSlideId);
                  setDraggedSlideId(null);
                }
              }}
            >
              <div className="flex items-center gap-3 h-full min-w-max">
                {playlist.slideIds.length === 0 ? (
                  <div className="flex items-center justify-center min-w-[400px] h-full border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-400 text-sm text-center px-4">
                      왼쪽에서 슬라이드를 드래그하여 추가하세요
                    </p>
                  </div>
                ) : (
                  <>
                    {playlist.slideIds.map((slideId, index) => {
                    const slide = allSlides.find((s) => s.id === slideId);
                    if (!slide) return null;

                    const project = allProjects.find((p) => p.id === slide.projectId);
                    const fileName = slide.image || slide.video;
                    const media = fileName
                      ? project?.media.find((m) => m.name === fileName)
                      : null;

                      return (
                        <div key={`${slideId}-${index}`} className="contents">
                          <div
                            draggable
                            onDragStart={() => setDraggedPlaylistIndex(index)}
                            onDragOver={(e) => {
                              if (draggedPlaylistIndex !== null && draggedPlaylistIndex !== index) {
                                e.preventDefault();
                              }
                              if (draggedSlideId) {
                                e.preventDefault();
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (draggedPlaylistIndex !== null && draggedPlaylistIndex !== index) {
                                handleReorderPlaylist(draggedPlaylistIndex, index);
                                setDraggedPlaylistIndex(null);
                              } else if (draggedSlideId) {
                                handleDropSlideToPlaylist(draggedSlideId, index);
                                setDraggedSlideId(null);
                              }
                            }}
                            onDragEnd={() => setDraggedPlaylistIndex(null)}
                            onClick={() => setSelectedSlideIndex(index)}
                            className={`relative flex-shrink-0 w-40 h-44 cursor-move transition-all ${
                              selectedSlideIndex === index
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
                                  handleRemoveSlideFromPlaylist(index);
                                }}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg z-10"
                              >
                                ✕
                              </button>

                              {/* 프로젝트 태그 */}
                              <div className="mb-1">
                                <span className="text-[10px] px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded truncate block">
                                  {slide.projectName}
                                </span>
                              </div>

                              {/* 썸네일 */}
                              <div
                                className="aspect-video rounded flex items-center justify-center mb-2"
                                style={{ backgroundColor: slide.backgroundColor }}
                              >
                                {slide.image || slide.video ? (
                                  <span className="text-4xl">{getFileIcon(media?.type || "")}</span>
                                ) : slide.text ? (
                                  <span className="text-4xl">📝</span>
                                ) : (
                                  <span className="text-4xl text-gray-300">📄</span>
                                )}
                              </div>

                              {/* 이름 */}
                              <div className="text-xs font-medium text-gray-800 truncate text-center">
                                {slide.name}
                              </div>
                              <div className="text-[10px] text-gray-500 text-center mt-0.5">
                                {slide.duration}초
                              </div>
                            </div>
                          </div>

                          {/* 화살표 (마지막 아이템이 아닐 때만) */}
                          {index < playlist.slideIds.length - 1 && (
                            <div
                              className="flex items-center justify-center flex-shrink-0 px-2"
                            >
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
