"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Slide } from "@/lib/types";
import { getProjectById } from "@/lib/data/projects";
import { formatDurationSeconds, getFileIcon } from "@/lib/utils/fileIcons";
import { getDefaultAnimationConfig } from "@/lib/animation-specs";
import MediaLibraryPanel from "@/app/components/MediaLibraryPanel";
import SlideCanvas from "@/app/components/SlideCanvas";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [selectedMediaName, setSelectedMediaName] = useState<string | null>(null);
  const [showEditPanel, setShowEditPanel] = useState<boolean>(false);
  const [timelinePosition, setTimelinePosition] = useState<number>(0); // 타임라인 위치 (0 ~ duration)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const { id } = use(params);
  const project = getProjectById(Number(id));

  const getEffectiveDuration = (slide: Slide) => {
    const mediaName = slide.video || slide.image;
    const media = mediaName ? project?.media.find((m) => m.name === mediaName) : null;
    const mediaSeconds = media?.durationSeconds ?? null;
    if (!mediaSeconds) return slide.duration;
    return Math.max(slide.duration, mediaSeconds);
  };

  // 초기화
  useEffect(() => {
    if (project) {
      setSlides(project.slides);
    }
  }, [project]);

  useEffect(() => {
    if (!editingSlide) return;
    const effectiveDuration = getEffectiveDuration(editingSlide);
    setTimelinePosition((prev) => Math.min(prev, effectiveDuration));
  }, [editingSlide?.duration]);

  useEffect(() => {
    if (!editingSlide) return;
    setTimelinePosition(0);
    setIsPlaying(false);
  }, [editingSlide?.id]);

  useEffect(() => {
    if (!editingSlide || !isPlaying) return;
    const effectiveDuration = getEffectiveDuration(editingSlide);

    const tickMs = 33;
    const step = tickMs / 1000;
    const intervalId = window.setInterval(() => {
      setTimelinePosition((prev) => {
        const next = prev + step;
        if (next >= effectiveDuration) {
          setIsPlaying(false);
          return effectiveDuration;
        }
        return next;
      });
    }, tickMs);

    return () => window.clearInterval(intervalId);
  }, [editingSlide, isPlaying]);


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

  // 슬라이드 편집 시작
  const handleEditSlide = (slide: Slide) => {
    setEditingSlide({ ...slide });
    setSelectedMediaName(null);
    setTimelinePosition(0); // 타임라인 리셋
    setIsPlaying(false);
  };

  // 새 슬라이드 생성
  const handleCreateSlide = () => {
    const newSlide: Slide = {
      id: `slide_${Date.now()}`,
      name: `슬라이드 ${slides.length + 1}`,
      projectId: project.id,
      projectName: project.name,
      backgroundColor: "#FFFFFF",
      text: "",
      fontSize: 32,
      textColor: "#000000",
      textPositionX: 50,
      textPositionY: 50,
      resolutionWidth: 1920,
      resolutionHeight: 1080,
      duration: 10, // 기본 10초
    };
    setEditingSlide(newSlide);
    setTimelinePosition(0); // 타임라인 리셋
    setIsPlaying(false);
  };

  // 슬라이드 저장
  const handleSaveSlide = () => {
    if (!editingSlide) return;

    const existingIndex = slides.findIndex(s => s.id === editingSlide.id);
    if (existingIndex >= 0) {
      // 기존 슬라이드 수정
      const updated = [...slides];
      updated[existingIndex] = editingSlide;
      setSlides(updated);
    } else {
      // 새 슬라이드 추가
      setSlides([...slides, editingSlide]);
    }
    setEditingSlide(null);
    setIsPlaying(false);
  };

  // 슬라이드 편집 취소
  const handleCancelEditSlide = () => {
    setEditingSlide(null);
    setIsPlaying(false);
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
              <h3 className="font-semibold text-gray-800 mb-1">프로젝트 슬라이드 관리</h3>
              <p className="text-sm text-gray-600">
                이 프로젝트의 <strong>슬라이드</strong>를 생성하고 편집하세요.
                생성된 슬라이드는 플레이리스트 메뉴에서 조합할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 슬라이드 목록 */}
      <div className="flex gap-4 h-[calc(100vh-300px)]">
        <div className="w-full bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">슬라이드 ({slides.length})</h2>
            <button
              onClick={handleCreateSlide}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              + 슬라이드
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {slides.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                슬라이드가 없습니다
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
                {slides.map((slide) => {
                  const fileName = slide.image || slide.video;
                  const media = fileName ? project.media.find(m => m.name === fileName) : null;

                  return (
                    <div
                      key={slide.id}
                      onClick={() => handleEditSlide(slide)}
                      className="group bg-white rounded-lg border-2 shadow-sm cursor-pointer transition-all hover:shadow-lg border-gray-200 hover:border-green-400 overflow-hidden"
                    >
                      {/* 16:9 미리보기 */}
                      <div
                        className="aspect-video relative flex items-center justify-center"
                        style={{ backgroundColor: slide.backgroundColor }}
                      >
                        {/* 미디어 배경 */}
                        {(slide.image || slide.video) && media && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl opacity-20">{getFileIcon(media.type)}</span>
                          </div>
                        )}

                        {/* 텍스트 오버레이 */}
                        {slide.text && (
                          <div
                            className="absolute inset-0 flex items-center justify-center p-3 text-center"
                            style={{
                              color: slide.textColor || "#000000",
                              fontSize: `${Math.min(slide.fontSize || 32, 24)}px`,
                              fontWeight: "bold",
                              lineHeight: "1.2",
                            }}
                          >
                            <div className="line-clamp-4">
                              {slide.text}
                            </div>
                          </div>
                        )}

                        {/* 빈 슬라이드 */}
                        {!slide.text && !slide.image && !slide.video && (
                          <div className="text-gray-300 text-center">
                            <span className="text-5xl">📄</span>
                          </div>
                        )}

                        {/* 호버 오버레이 */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white bg-opacity-90 px-3 py-1.5 rounded-lg">
                            <span className="text-xs font-semibold text-gray-800">편집하기</span>
                          </div>
                        </div>
                      </div>

                      {/* 정보 */}
                      <div className="p-2 bg-white border-t">
                        <h3 className="font-bold text-xs text-gray-800 truncate mb-1">{slide.name}</h3>
                        {media && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <span className="truncate">{media.name}</span>
                            {media.durationSeconds && (
                              <>
                                <span>•</span>
                                <span>{formatDurationSeconds(media.durationSeconds)}</span>
                              </>
                            )}
                          </div>
                        )}
                        {!media && slide.text && (
                          <p className="text-[11px] text-gray-500 truncate">텍스트 슬라이드</p>
                        )}
                        <div className="mt-1 flex items-center gap-2 text-[11px]">
                          <span className="text-gray-500">재생:</span>
                          <span className="font-semibold text-blue-600">{slide.duration}초</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 슬라이드 편집 모달 */}
      {editingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                슬라이드 편집
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelEditSlide}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveSlide}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                >
                  저장
                </button>
              </div>
            </div>

            {/* 모달 본문 */}
            <div className="flex-1 flex overflow-hidden">
              <MediaLibraryPanel
                media={project.media}
                selectedMediaName={selectedMediaName}
                onSelect={setSelectedMediaName}
                footer={
                  selectedMediaName && (() => {
                    const selectedMedia = project.media.find(m => m.name === selectedMediaName);
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
                            {selectedMedia.durationSeconds && (
                              <div className="flex justify-between">
                                <span>재생시간:</span>
                                <span className="font-medium">{formatDurationSeconds(selectedMedia.durationSeconds)}</span>
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
                  })()
                }
              />

              {/* 중앙 + 우측 영역 */}
              <div className="flex-1 flex">
                {/* 중앙: 캔버스 미리보기 */}
                <div className="flex-1 flex flex-col bg-gray-100 items-center justify-center p-8">
                  {/* 슬라이드 이름 */}
                  <div className="w-full max-w-4xl mb-3">
                    <input
                      type="text"
                      value={editingSlide.name}
                      onChange={(e) => setEditingSlide({ ...editingSlide, name: e.target.value })}
                      className="text-lg font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-cyan-500 focus:outline-none px-2 py-1 w-full"
                      placeholder="슬라이드 이름"
                    />
                  </div>

                  {/* 캔버스 미리보기 */}
                  <SlideCanvas
                    slide={editingSlide}
                    media={project.media}
                    selectedMediaName={selectedMediaName}
                    timelinePosition={timelinePosition}
                    onApplyMedia={(mediaName) => {
                      const selected = project.media.find((item) => item.name === mediaName);
                      if (!selected) return;
                      setEditingSlide((prev) =>
                        prev
                          ? {
                              ...prev,
                              image: selected.type === "image" ? mediaName : undefined,
                              video: selected.type === "video" ? mediaName : undefined,
                              duration: selected.type === "video" && selected.durationSeconds
                                ? selected.durationSeconds
                                : prev.duration,
                            }
                          : prev
                      );
                    }}
                    onUpdateSlide={(updater) =>
                      setEditingSlide((prev) => (prev ? updater(prev) : prev))
                    }
                    onRequestEditPanel={() => setShowEditPanel(true)}
                  />

                  {/* 타임라인 슬라이더 */}
                  <div className="w-full max-w-4xl mt-4 bg-white rounded-lg p-4 shadow">
                    {(() => {
                      const effectiveDuration = getEffectiveDuration(editingSlide);
                      return (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">타임라인 미리보기</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsPlaying((prev) => !prev)}
                                className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                              >
                                {isPlaying ? "⏸️" : "▶️"}
                              </button>
                              <button
                                onClick={() => {
                                  setIsPlaying(false);
                                  setTimelinePosition(0);
                                }}
                                className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                              >
                                ⏹️
                              </button>
                              <span className="text-sm text-gray-600">
                                {timelinePosition.toFixed(1)}s / {effectiveDuration}s
                              </span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={effectiveDuration}
                            step="0.05"
                            value={timelinePosition}
                            onChange={(e) => {
                              setIsPlaying(false);
                              setTimelinePosition(Number(e.target.value));
                            }}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0s</span>
                            <span>{(effectiveDuration / 2).toFixed(1)}s</span>
                            <span>{effectiveDuration}s</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 우측: 편집 패널 (조건부 표시) */}
                {showEditPanel && (
                  <div className="w-80 border-l flex flex-col bg-white">
                    <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                      <h3 className="font-semibold text-gray-700">편집</h3>
                      <button
                        onClick={() => setShowEditPanel(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      {/* 재생 시간 */}
                      <div>
                        {(() => {
                          const mediaName = editingSlide.video || editingSlide.image;
                          const media = mediaName
                            ? project.media.find((m) => m.name === mediaName)
                            : null;
                          const mediaSeconds = media?.durationSeconds ?? null;
                          const isVideoLocked = Boolean(editingSlide.video && mediaSeconds);
                          const displaySeconds = isVideoLocked ? mediaSeconds : editingSlide.duration;

                          return (
                            <>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                재생 시간: {displaySeconds}초
                                {isVideoLocked && (
                                  <span className="ml-2 text-xs text-gray-400">(동영상 길이에 고정)</span>
                                )}
                              </label>
                              <input
                                type="range"
                                min="1"
                                max="60"
                                value={displaySeconds}
                                disabled={isVideoLocked}
                                onChange={(e) => {
                                  const newDuration = Number(e.target.value);
                                  setEditingSlide({ ...editingSlide, duration: newDuration });
                                  if (timelinePosition > newDuration) {
                                    setTimelinePosition(newDuration);
                                  }
                                }}
                                className={`w-full ${isVideoLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>1초</span>
                                <span>60초</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* 배경색 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          배경색
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={editingSlide.backgroundColor}
                            onChange={(e) => setEditingSlide({ ...editingSlide, backgroundColor: e.target.value })}
                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingSlide.backgroundColor}
                            onChange={(e) => setEditingSlide({ ...editingSlide, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>

                      {/* 해상도 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          해상도 (px)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            value={editingSlide.resolutionWidth || 1920}
                            onChange={(e) => setEditingSlide({
                              ...editingSlide,
                              resolutionWidth: Number(e.target.value)
                            })}
                            className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                            placeholder="가로"
                          />
                          <input
                            type="number"
                            min="1"
                            value={editingSlide.resolutionHeight || 1080}
                            onChange={(e) => setEditingSlide({
                              ...editingSlide,
                              resolutionHeight: Number(e.target.value)
                            })}
                            className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                            placeholder="세로"
                          />
                        </div>
                      </div>

                      {/* 텍스트 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          텍스트
                        </label>
                        <textarea
                          value={editingSlide.text || ""}
                          onChange={(e) => setEditingSlide({ ...editingSlide, text: e.target.value })}
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
                            value={editingSlide.textColor || "#000000"}
                            onChange={(e) => setEditingSlide({ ...editingSlide, textColor: e.target.value })}
                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingSlide.textColor || "#000000"}
                            onChange={(e) => setEditingSlide({ ...editingSlide, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>

                      {/* 폰트 크기 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          폰트 크기: {editingSlide.fontSize || 32}px
                        </label>
                        <input
                          type="range"
                          min="16"
                          max="120"
                          value={editingSlide.fontSize || 32}
                          onChange={(e) => setEditingSlide({ ...editingSlide, fontSize: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      {/* 텍스트 슬라이딩 이펙트 */}
                      {editingSlide.text && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              텍스트 슬라이딩 이펙트
                            </label>
                            <select
                              value={editingSlide.textAnimation || "none"}
                              onChange={(e) => {
                                const newAnimation = e.target.value as any;
                                const defaultConfig = getDefaultAnimationConfig(newAnimation, editingSlide.duration);
                                setEditingSlide({
                                  ...editingSlide,
                                  textAnimation: newAnimation,
                                  textAnimationDuration: defaultConfig.duration,
                                  textAnimationDelay: defaultConfig.delay,
                                  textAnimationRepeat: defaultConfig.repeat,
                                  textAnimationGap: defaultConfig.gap,
                                  textFadeInDuration: defaultConfig.fadeInDuration,
                                  textFadeOutDuration: defaultConfig.fadeOutDuration
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded"
                            >
                              <option value="none">없음 (정적)</option>
                              <option value="fade-in-out">페이드 인-아웃</option>
                              <option value="slide-horizontal">가로 스크롤</option>
                              <option value="slide-vertical">세로 스크롤</option>
                            </select>
                          </div>

                          {editingSlide.textAnimation === "fade-in-out" ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  페이드 인 시간 (초)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  max={editingSlide.duration}
                                  value={editingSlide.textFadeInDuration ?? 0.6}
                                  onChange={(e) => setEditingSlide({
                                    ...editingSlide,
                                    textFadeInDuration: Number(e.target.value)
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  페이드 아웃 시간 (초)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  max={editingSlide.duration}
                                  value={editingSlide.textFadeOutDuration ?? 0.8}
                                  onChange={(e) => setEditingSlide({
                                    ...editingSlide,
                                    textFadeOutDuration: Number(e.target.value)
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              {(() => {
                                const repeat = editingSlide.textAnimationRepeat ?? 1;
                                const duration = editingSlide.duration;
                                const minLoop = 0.1;
                                const maxGap = repeat > 1
                                  ? Math.max(0, (duration - (repeat * minLoop)) / (repeat - 1))
                                  : duration;
                                return (
                                  <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  반복 횟수 (0 = 무한 반복)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={editingSlide.textAnimationRepeat ?? 1}
                                  onChange={(e) => setEditingSlide({
                                    ...editingSlide,
                                    textAnimationRepeat: Math.max(0, Number(e.target.value))
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  반복 간격 (초)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  max={repeat > 0 ? maxGap : undefined}
                                  value={editingSlide.textAnimationGap ?? 0}
                                  onChange={(e) => setEditingSlide({
                                    ...editingSlide,
                                    textAnimationGap: Math.max(0, Math.min(maxGap, Number(e.target.value)))
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                              </div>
                                  </>
                                );
                              })()}
                            </>
                          )}
                        </>
                      )}

                      {/* 미디어 제거 버튼 */}
                      {(editingSlide.image || editingSlide.video) && (
                        <div>
                          <button
                            onClick={() => setEditingSlide({
                              ...editingSlide,
                              image: undefined,
                              video: undefined
                            })}
                            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            미디어 제거
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
