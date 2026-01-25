"use client";

import { useState, use, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Slide, MediaFile } from "@/lib/types";
import type { ProjectRow, MediaRow, SlideRow } from "@/lib/types/database";
import { supabase } from "@/lib/supabase/client";
import { getFileIcon } from "@/lib/utils/fileIcons";
import { formatDurationSeconds, formatFileSize, sanitizeFileName } from "@/lib/utils/formatting";
import { mapDbSlideToSlide, mapDbMediaToMediaFile, buildSlideContent } from "@/lib/data/mappers";
import { SLIDE_DEFAULTS } from "@/lib/config";
import { getDefaultAnimationConfig, type TextAnimationType } from "@/lib/animation-specs";
import { useTimelinePlayback, useSlideHistory } from "@/lib/hooks";
import MediaLibraryPanel from "@/app/components/MediaLibraryPanel";
import SlideCanvas from "@/app/components/SlideCanvas";
import SlideThumbnail from "@/app/components/SlideThumbnail";
import { SlideEditorToolbar, type ToolbarAction } from "@/app/components/SlideEditorToolbar";
import {
  BackgroundPanel,
  ImagePanel,
  TextPanel,
  AudioPanel,
  type ElementType,
} from "@/app/components/SlideElementPanels";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [selectedMediaName, setSelectedMediaName] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<ElementType>(null);
  const [clipboard, setClipboard] = useState<Partial<Slide> | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [mediaRows, setMediaRows] = useState<MediaRow[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [savingSlide, setSavingSlide] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { id } = use(params);

  // History management for undo/redo
  const slideHistory = useSlideHistory(editingSlide);

  // Update editingSlide when history changes
  useEffect(() => {
    if (slideHistory.currentSlide && slideHistory.currentSlide.id === editingSlide?.id) {
      setEditingSlide(slideHistory.currentSlide);
    }
  }, [slideHistory.currentSlide]);

  const media = useMemo<MediaFile[]>(
    () => mediaRows.map(mapDbMediaToMediaFile),
    [mediaRows]
  );

  const visualMedia = useMemo(
    () => media.filter((item) => item.type === "image" || item.type === "video"),
    [media]
  );

  const handleImportMedia = () => {
    if (uploadingMedia) return;
    fileInputRef.current?.click();
  };

  const handleMediaFileSelect = async (file: File) => {
    setUploadingMedia(true);
    setUploadMessage(`업로드 중... ${file.name}`);
    const safeName = sanitizeFileName(file.name);
    const filePath = `${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("media").upload(filePath, file);
    if (error) {
      setUploadingMedia(false);
      setUploadMessage(`업로드 실패: ${error.message}`);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(filePath);
    const type = file.type.startsWith("video")
      ? "video"
      : file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("audio")
          ? "audio"
          : "other";

    const { data: rowData, error: rowError } = await supabase
      .from("media")
      .insert({
        name: file.name,
        type,
        bucket: "media",
        path: filePath,
        url: publicUrlData.publicUrl,
        size_bytes: file.size,
        duration_seconds: null,
        mime_type: file.type || null,
      })
      .select("*")
      .single();

    setUploadingMedia(false);
    if (rowError || !rowData) {
      setUploadMessage(`업로드 실패: ${rowError?.message || "DB 저장 실패"}`);
      return;
    }
    setMediaRows((prev) => [rowData as MediaRow, ...prev]);
    setUploadMessage(`업로드 완료: ${rowData.name}`);
  };

  const handleDeleteMedia = async (id: string) => {
    const target = mediaRows.find((item) => item.id === id);
    if (!target) return;
    if (!window.confirm(`삭제할까요?\n${target.name}`)) return;
    if (target.path) {
      await supabase.storage.from("media").remove([target.path]);
    }
    const { error } = await supabase.from("media").delete().eq("id", id);
    if (error) {
      setUploadMessage(`삭제 실패: ${error.message}`);
      return;
    }
    setMediaRows((prev) => prev.filter((item) => item.id !== id));
    setUploadMessage(`삭제 완료: ${target.name}`);
  };

  const mediaByName = useMemo(() => {
    return new Map(mediaRows.map((item) => [item.name, item]));
  }, [mediaRows]);

  const mediaById = useMemo(() => {
    return new Map(mediaRows.map((item) => [item.id, item]));
  }, [mediaRows]);

  const getEffectiveDuration = (slide: Slide) => {
    const mediaId = slide.mediaId || null;
    const mediaItem = mediaId ? mediaRows.find((m) => m.id === mediaId) : null;
    const mediaSeconds = mediaItem?.duration_seconds ?? null;
    if (!mediaSeconds) return slide.duration;
    return Math.max(slide.duration, mediaSeconds);
  };

  const effectiveDuration = editingSlide ? getEffectiveDuration(editingSlide) : 10;
  const [timelinePosition, setTimelinePosition] = useTimelinePlayback(effectiveDuration, isPlaying);

  // 초기화 - 병렬 데이터 페칭으로 성능 개선
  useEffect(() => {
    const load = async () => {
      // 3개의 쿼리를 병렬로 실행 (성능 3배 향상)
      const [projectResult, slideResult, mediaResult] = await Promise.all([
        supabase
          .from("projects")
          .select("id,name,description,created_at")
          .eq("id", id)
          .single(),
        supabase
          .from("slides")
          .select("*")
          .eq("project_id", id)
          .order("order_index", { ascending: true }),
        supabase
          .from("media")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      const projectData = projectResult.data;
      const slideData = slideResult.data;
      const mediaData = mediaResult.data;

      const projectName = projectData?.name || "";
      const mediaByIdLocal = new Map<string, MediaRow>(
        (mediaData || []).map((item: MediaRow) => [item.id, item])
      );
      const mappedSlides: Slide[] = (slideData || []).map((row: SlideRow) =>
        mapDbSlideToSlide(row, mediaByIdLocal, projectName)
      );

      setProject(projectData || null);
      setMediaRows((mediaData as MediaRow[]) || []);
      setSlides(mappedSlides);
    };

    void load();
  }, [id]);

  // 슬라이드 변경 시 타임라인 리셋
  useEffect(() => {
    if (!editingSlide) return;
    setTimelinePosition(0);
    setIsPlaying(false);
  }, [editingSlide?.id, setTimelinePosition]);

  // 재생이 끝에 도달하면 정지
  useEffect(() => {
    if (timelinePosition >= effectiveDuration && isPlaying) {
      setIsPlaying(false);
    }
  }, [timelinePosition, effectiveDuration, isPlaying]);

  // 키보드 단축키 핸들러
  useEffect(() => {
    if (!editingSlide) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      const isMac = navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlKey && e.key === "z") {
        e.preventDefault();
        const undoSlide = slideHistory.undo();
        if (undoSlide) setEditingSlide(undoSlide);
      } else if (ctrlKey && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        const redoSlide = slideHistory.redo();
        if (redoSlide) setEditingSlide(redoSlide);
      } else if (ctrlKey && e.key === "c" && selectedElement) {
        e.preventDefault();
        // Copy logic (same as toolbar)
        if (selectedElement === "text") {
          setClipboard({
            text: editingSlide.text,
            textColor: editingSlide.textColor,
            fontSize: editingSlide.fontSize,
            textPositionX: editingSlide.textPositionX,
            textPositionY: editingSlide.textPositionY,
          });
        } else if (selectedElement === "image") {
          setClipboard({
            image: editingSlide.image,
            video: editingSlide.video,
            mediaId: editingSlide.mediaId,
            mediaScaleX: editingSlide.mediaScaleX,
            mediaScaleY: editingSlide.mediaScaleY,
            mediaOffsetX: editingSlide.mediaOffsetX,
            mediaOffsetY: editingSlide.mediaOffsetY,
          });
        }
      } else if (ctrlKey && e.key === "v" && clipboard) {
        e.preventDefault();
        const updated = { ...editingSlide, ...clipboard };
        setEditingSlide(updated);
        slideHistory.pushHistory(updated);
      } else if (ctrlKey && e.key === "x" && selectedElement === "text") {
        e.preventDefault();
        setClipboard({
          text: editingSlide.text,
          textColor: editingSlide.textColor,
          fontSize: editingSlide.fontSize,
          textPositionX: editingSlide.textPositionX,
          textPositionY: editingSlide.textPositionY,
        });
        const updated = {
          ...editingSlide,
          text: undefined,
          textColor: undefined,
          fontSize: undefined,
          textPositionX: undefined,
          textPositionY: undefined,
        };
        setEditingSlide(updated);
        slideHistory.pushHistory(updated);
      } else if (e.key === "Delete" && selectedElement) {
        e.preventDefault();
        let deleteUpdated = { ...editingSlide };
        if (selectedElement === "text") {
          deleteUpdated.text = undefined;
        } else if (selectedElement === "image") {
          deleteUpdated.image = undefined;
          deleteUpdated.video = undefined;
          deleteUpdated.mediaId = undefined;
        } else if (selectedElement === "audio") {
          deleteUpdated.audio = undefined;
          deleteUpdated.audioMediaId = undefined;
        }
        setEditingSlide(deleteUpdated);
        slideHistory.pushHistory(deleteUpdated);
        setSelectedElement(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingSlide, selectedElement, clipboard, slideHistory]);

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
  };

  // 새 슬라이드 생성
  const handleCreateSlide = () => {
    const newSlide: Slide = {
      id: `slide_${Date.now()}`,
      name: `슬라이드 ${slides.length + 1}`,
      projectId: project.id,
      projectName: project.name,
      backgroundColor: SLIDE_DEFAULTS.BACKGROUND_COLOR,
      text: "",
      fontSize: SLIDE_DEFAULTS.FONT_SIZE,
      textColor: SLIDE_DEFAULTS.TEXT_COLOR,
      textPositionX: SLIDE_DEFAULTS.TEXT_POSITION_X,
      textPositionY: SLIDE_DEFAULTS.TEXT_POSITION_Y,
      resolutionWidth: SLIDE_DEFAULTS.RESOLUTION_WIDTH,
      resolutionHeight: SLIDE_DEFAULTS.RESOLUTION_HEIGHT,
      duration: SLIDE_DEFAULTS.DURATION,
    };
    setEditingSlide(newSlide);
  };

  const resolveMediaId = (slide: Slide) => {
    if (slide.mediaId) return slide.mediaId;
    const mediaName = slide.video || slide.image;
    if (!mediaName) return null;
    const mediaItem = mediaByName.get(mediaName);
    return mediaItem?.id || null;
  };

  const resolveAudioId = (slide: Slide) => {
    if (slide.audioMediaId) return slide.audioMediaId;
    if (!slide.audio) return null;
    const audioItem = mediaByName.get(slide.audio);
    return audioItem?.id || null;
  };

  // 슬라이드 저장
  const handleSaveSlide = async () => {
    if (!editingSlide || !project) return;
    setSavingSlide(true);
    setSaveError(null);

    const existingIndex = slides.findIndex((s) => s.id === editingSlide.id);
    const mediaId = resolveMediaId(editingSlide);
    const payload = {
      project_id: project.id,
      name: editingSlide.name,
      type: editingSlide.video ? "video" : editingSlide.image ? "image" : "color",
      media_id: mediaId,
      audio_media_id: resolveAudioId(editingSlide),
      duration_seconds: editingSlide.duration,
      background_color: editingSlide.backgroundColor,
      resolution_width: editingSlide.resolutionWidth || SLIDE_DEFAULTS.RESOLUTION_WIDTH,
      resolution_height: editingSlide.resolutionHeight || SLIDE_DEFAULTS.RESOLUTION_HEIGHT,
      order_index: existingIndex >= 0 ? existingIndex : slides.length,
      content: buildSlideContent(editingSlide),
    };

    if (existingIndex >= 0) {
      const { data, error } = await supabase
        .from("slides")
        .update(payload)
        .eq("id", editingSlide.id)
        .select("*")
        .single();
      if (error || !data) {
        setSaveError(error?.message || "슬라이드 저장에 실패했습니다.");
        setSavingSlide(false);
        return;
      }
      const mapped = mapDbSlideToSlide(data as SlideRow, mediaById, project.name);
      const updated = [...slides];
      updated[existingIndex] = mapped;
      setSlides(updated);
    } else {
      const { data, error } = await supabase
        .from("slides")
        .insert(payload)
        .select("*")
        .single();
      if (error || !data) {
        setSaveError(error?.message || "슬라이드 저장에 실패했습니다.");
        setSavingSlide(false);
        return;
      }
      const mapped = mapDbSlideToSlide(data as SlideRow, mediaById, project.name);
      setSlides((prev) => [...prev, mapped]);
    }

    setEditingSlide(null);
    setSavingSlide(false);
  };

  const handleDeleteSlide = async (slideId: string) => {
    const target = slides.find((s) => s.id === slideId);
    if (!target) return;
    if (!window.confirm(`슬라이드를 삭제할까요?\n${target.name}`)) return;
    const { error } = await supabase.from("slides").delete().eq("id", slideId);
    if (error) {
      setSaveError(error.message);
      return;
    }
    setSlides((prev) => prev.filter((s) => s.id !== slideId));
    if (editingSlide?.id === slideId) {
      setEditingSlide(null);
    }
  };

  // 슬라이드 편집 취소
  const handleCancelEditSlide = () => {
    setEditingSlide(null);
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
            <p className="text-gray-600 mt-1">{project.description || "미정"}</p>
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
                  const slideMedia = fileName ? media.find((m) => m.name === fileName) : null;

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
                        <button
                          className="absolute right-2 top-2 z-20 w-7 h-7 rounded-full bg-white/90 text-gray-500 hover:text-red-600 shadow opacity-100 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(slide.id);
                          }}
                          title="삭제"
                        >
                          ✕
                        </button>

                        <SlideThumbnail slide={slide} media={slideMedia} />

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
                        {slideMedia && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <span className="truncate">{slideMedia.name}</span>
                            {slideMedia.durationSeconds && (
                              <>
                                <span>•</span>
                                <span>{formatDurationSeconds(slideMedia.durationSeconds)}</span>
                              </>
                            )}
                          </div>
                        )}
                        {!slideMedia && slide.text && (
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
              <div className="flex items-center gap-4">
                {uploadMessage && (
                  <div className="text-sm text-gray-600">
                    {uploadMessage}
                  </div>
                )}
                {saveError && (
                  <div className="text-sm text-red-600">
                    저장 실패: {saveError}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelEditSlide}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveSlide}
                  disabled={savingSlide}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:opacity-60"
                >
                  {savingSlide ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>

            {/* 툴바 */}
            <SlideEditorToolbar
              canUndo={slideHistory.canUndo}
              canRedo={slideHistory.canRedo}
              hasSelection={selectedElement !== null}
              hasClipboard={clipboard !== null}
              onAction={(action: ToolbarAction) => {
                switch (action) {
                  case "undo":
                    const undoSlide = slideHistory.undo();
                    if (undoSlide) setEditingSlide(undoSlide);
                    break;
                  case "redo":
                    const redoSlide = slideHistory.redo();
                    if (redoSlide) setEditingSlide(redoSlide);
                    break;
                  case "copy":
                    if (!selectedElement || !editingSlide) break;
                    if (selectedElement === "text") {
                      setClipboard({
                        text: editingSlide.text,
                        textColor: editingSlide.textColor,
                        fontSize: editingSlide.fontSize,
                        textPositionX: editingSlide.textPositionX,
                        textPositionY: editingSlide.textPositionY,
                      });
                    } else if (selectedElement === "image") {
                      setClipboard({
                        image: editingSlide.image,
                        video: editingSlide.video,
                        mediaId: editingSlide.mediaId,
                        mediaScaleX: editingSlide.mediaScaleX,
                        mediaScaleY: editingSlide.mediaScaleY,
                        mediaOffsetX: editingSlide.mediaOffsetX,
                        mediaOffsetY: editingSlide.mediaOffsetY,
                      });
                    } else if (selectedElement === "background") {
                      setClipboard({
                        backgroundColor: editingSlide.backgroundColor,
                        resolutionWidth: editingSlide.resolutionWidth,
                        resolutionHeight: editingSlide.resolutionHeight,
                      });
                    } else if (selectedElement === "audio") {
                      setClipboard({
                        audio: editingSlide.audio,
                        audioMediaId: editingSlide.audioMediaId,
                      });
                    }
                    break;
                  case "cut":
                    if (!selectedElement || !editingSlide) break;
                    // Copy first
                    if (selectedElement === "text") {
                      setClipboard({
                        text: editingSlide.text,
                        textColor: editingSlide.textColor,
                        fontSize: editingSlide.fontSize,
                        textPositionX: editingSlide.textPositionX,
                        textPositionY: editingSlide.textPositionY,
                      });
                      const updated = {
                        ...editingSlide,
                        text: undefined,
                        textColor: undefined,
                        fontSize: undefined,
                        textPositionX: undefined,
                        textPositionY: undefined,
                      };
                      setEditingSlide(updated);
                      slideHistory.pushHistory(updated);
                    }
                    break;
                  case "paste":
                    if (!clipboard || !editingSlide) break;
                    const updated = { ...editingSlide, ...clipboard };
                    setEditingSlide(updated);
                    slideHistory.pushHistory(updated);
                    break;
                  case "delete":
                    if (!selectedElement || !editingSlide) break;
                    let deleteUpdated = { ...editingSlide };
                    if (selectedElement === "text") {
                      deleteUpdated.text = undefined;
                    } else if (selectedElement === "image") {
                      deleteUpdated.image = undefined;
                      deleteUpdated.video = undefined;
                      deleteUpdated.mediaId = undefined;
                    } else if (selectedElement === "audio") {
                      deleteUpdated.audio = undefined;
                      deleteUpdated.audioMediaId = undefined;
                    }
                    setEditingSlide(deleteUpdated);
                    slideHistory.pushHistory(deleteUpdated);
                    setSelectedElement(null);
                    break;
                  case "duplicate":
                    // For now, just copy
                    if (selectedElement && editingSlide) {
                      // Same as copy
                      if (selectedElement === "text") {
                        setClipboard({
                          text: editingSlide.text,
                          textColor: editingSlide.textColor,
                          fontSize: editingSlide.fontSize,
                        });
                      }
                    }
                    break;
                }
              }}
            />

            {/* 모달 본문 */}
            <div className="flex-1 flex overflow-hidden">
              <MediaLibraryPanel
                media={visualMedia}
                selectedMediaName={selectedMediaName}
                onSelect={setSelectedMediaName}
                onImport={handleImportMedia}
                onDelete={handleDeleteMedia}
                footer={
                  selectedMediaName && (() => {
                    const selectedMedia = mediaByName.get(selectedMediaName);
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
                                <span className="font-medium">{formatFileSize(selectedMedia.size_bytes || 0)}</span>
                              </div>
                            {selectedMedia.duration_seconds && (
                              <div className="flex justify-between">
                                <span>재생시간:</span>
                                <span className="font-medium">{formatDurationSeconds(selectedMedia.duration_seconds)}</span>
                              </div>
                            )}
                              <div className="flex justify-between">
                                <span>업로드:</span>
                                <span className="font-medium">{selectedMedia.created_at?.slice(0, 10) || ""}</span>
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

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleMediaFileSelect(file);
                  }
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
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
                    media={visualMedia}
                    selectedMediaName={selectedMediaName}
                    timelinePosition={timelinePosition}
                    onApplyMedia={(mediaName) => {
                      const selected = mediaByName.get(mediaName);
                      if (!selected) return;
                      if (selected.type === "audio") return;
                      setEditingSlide((prev) =>
                        prev
                          ? {
                              ...prev,
                              image: selected.type === "image" ? mediaName : undefined,
                              video: selected.type === "video" ? mediaName : undefined,
                              mediaId: selected.id,
                              mediaScaleX: 1,
                              mediaScaleY: 1,
                              mediaOffsetX: 0,
                              mediaOffsetY: 0,
                              duration:
                                selected.type === "video" && selected.duration_seconds
                                  ? selected.duration_seconds
                                  : prev.duration,
                            }
                          : prev
                      );
                    }}
                    onUpdateSlide={(updater) => {
                      setEditingSlide((prev) => {
                        const updated = prev ? updater(prev) : prev;
                        if (updated) slideHistory.pushHistory(updated);
                        return updated;
                      });
                    }}
                    onRequestEditPanel={() => {}}
                    onSelectElement={setSelectedElement}
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

                {/* 우측: 속성 패널 (항상 표시) */}
                <div className="w-80 border-l flex flex-col bg-white">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-700">
                      {!selectedElement && "속성 편집"}
                      {selectedElement === "background" && "배경 편집"}
                      {selectedElement === "image" && "이미지/비디오 편집"}
                      {selectedElement === "text" && "텍스트 편집"}
                      {selectedElement === "audio" && "오디오 편집"}
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {!selectedElement && (
                      <div className="text-center text-gray-500 mt-8">
                        <p className="text-sm mb-2">💡</p>
                        <p className="text-xs">캔버스에서 요소를 선택하거나</p>
                        <p className="text-xs">배경을 클릭하여 편집하세요</p>
                      </div>
                    )}
                    {selectedElement === "background" && (
                      <BackgroundPanel
                        slide={editingSlide}
                        onUpdate={(updates) => {
                          const updated = { ...editingSlide, ...updates };
                          setEditingSlide(updated);
                          slideHistory.pushHistory(updated);
                        }}
                      />
                    )}
                    {selectedElement === "image" && (
                      <ImagePanel
                        slide={editingSlide}
                        onUpdate={(updates) => {
                          const updated = { ...editingSlide, ...updates };
                          setEditingSlide(updated);
                          slideHistory.pushHistory(updated);
                        }}
                      />
                    )}
                    {selectedElement === "text" && (
                      <TextPanel
                        slide={editingSlide}
                        onUpdate={(updates) => {
                          const updated = { ...editingSlide, ...updates };
                          setEditingSlide(updated);
                          slideHistory.pushHistory(updated);
                        }}
                      />
                    )}
                    {selectedElement === "audio" && (
                      <AudioPanel
                        slide={editingSlide}
                        onUpdate={(updates) => {
                          const updated = { ...editingSlide, ...updates };
                          setEditingSlide(updated);
                          slideHistory.pushHistory(updated);
                        }}
                      />
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

