"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Playlist, Slide } from "@/lib/types";
import type { MediaRow, SlideRow } from "@/lib/types/database";
import { supabase } from "@/lib/supabase/client";
import { formatTotalDuration } from "@/lib/utils/formatting";
import { mapDbSlideToSlide, mapDbMediaToMediaFile } from "@/lib/data/mappers";
import SlideLibraryPanel, { type SlideWithMedia } from "@/app/components/SlideLibraryPanel";
import SlideThumbnail from "@/app/components/SlideThumbnail";

type PlaylistRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

type PlaylistItemRow = {
  playlist_id: string;
  slide_id: string;
  order_index: number;
};

type ProjectRow = {
  id: string;
  name: string;
};

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [allSlides, setAllSlides] = useState<Slide[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [mediaRows, setMediaRows] = useState<MediaRow[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [draggedSlideId, setDraggedSlideId] = useState<string | null>(null);
  const [draggedPlaylistIndex, setDraggedPlaylistIndex] = useState<number | null>(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string | null>(null);
  const [playlistHeight, setPlaylistHeight] = useState<number>(384);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      // 5개의 쿼리를 병렬로 실행 (성능 5배 향상)
      const [playlistResult, playlistItemResult, projectResult, mediaResult, slideResult] =
        await Promise.all([
          supabase
            .from("playlists")
            .select("id,name,description,created_at")
            .eq("id", playlistId)
            .single(),
          supabase
            .from("playlist_items")
            .select("playlist_id,slide_id,order_index")
            .eq("playlist_id", playlistId)
            .order("order_index", { ascending: true }),
          supabase.from("projects").select("id,name"),
          supabase.from("media").select("*"),
          supabase.from("slides").select("*"),
        ]);

      const playlistData = playlistResult.data;
      const playlistItemData = playlistItemResult.data;
      const projectData = projectResult.data;
      const mediaData = mediaResult.data;
      const slideData = slideResult.data;

      const projectById = new Map((projectData || []).map((p: ProjectRow) => [p.id, p.name]));
      const mediaById = new Map((mediaData || []).map((m: MediaRow) => [m.id, m]));

      const mappedSlides: Slide[] = (slideData || []).map((row: SlideRow) => {
        const projectName = projectById.get(row.project_id) || "프로젝트";
        return mapDbSlideToSlide(row, mediaById, projectName);
      });

      const orderedSlideIds = (playlistItemData || []).map(
        (item: PlaylistItemRow) => item.slide_id
      );

      if (playlistData) {
        setPlaylist({
          id: playlistData.id,
          name: playlistData.name,
          description: playlistData.description || "",
          slideIds: orderedSlideIds,
          status: "active",
          createdAt: playlistData.created_at?.slice(0, 10) || "",
        });
      }

      setAllSlides(mappedSlides);
      setProjects((projectData as ProjectRow[]) || []);
      setMediaRows((mediaData as MediaRow[]) || []);
    };

    void load();
  }, [playlistId]);

  const filteredSlides = useMemo(() => {
    if (!selectedProjectFilter) return allSlides;
    return allSlides.filter((slide) => slide.projectId === selectedProjectFilter);
  }, [allSlides, selectedProjectFilter]);

  const mediaByName = useMemo(() => {
    return new Map(mediaRows.map((item) => [item.name, item]));
  }, [mediaRows]);

  const slidesWithMedia = useMemo((): SlideWithMedia[] => {
    return filteredSlides.map((slide) => {
      const fileName = slide.image || slide.video;
      const mediaRow = fileName ? mediaByName.get(fileName) : null;
      const media = mediaRow ? mapDbMediaToMediaFile(mediaRow) : null;
      return {
        slide,
        media,
      };
    });
  }, [filteredSlides, mediaByName]);

  const handleDropSlideToPlaylist = (slideId: string, insertIndex?: number) => {
    if (!playlist) return;
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
    if (!playlist) return;
    const newSlideIds = playlist.slideIds.filter((_, i) => i !== index);
    setPlaylist({ ...playlist, slideIds: newSlideIds });
    if (selectedSlideIndex >= newSlideIds.length) {
      setSelectedSlideIndex(Math.max(0, newSlideIds.length - 1));
    }
  };

  const handleReorderPlaylist = (fromIndex: number, toIndex: number) => {
    if (!playlist) return;
    const newSlideIds = [...playlist.slideIds];
    const [removed] = newSlideIds.splice(fromIndex, 1);
    newSlideIds.splice(toIndex, 0, removed);
    setPlaylist({ ...playlist, slideIds: newSlideIds });
    if (selectedSlideIndex === fromIndex) {
      setSelectedSlideIndex(toIndex);
    }
  };

  const handleSavePlaylist = async () => {
    if (!playlist) return;
    await supabase.from("playlist_items").delete().eq("playlist_id", playlist.id);
    if (playlist.slideIds.length > 0) {
      const rows = playlist.slideIds.map((slideId, index) => ({
        playlist_id: playlist.id,
        slide_id: slideId,
        order_index: index,
      }));
      await supabase.from("playlist_items").insert(rows);
    }
    router.push("/dashboard/playlists");
  };

  const handleCancel = () => {
    router.push("/dashboard/playlists");
  };

  const handleCreateBlankSlide = async () => {
    if (!playlist) return;

    // Create a new blank slide in the database
    const { data: newSlide, error } = await supabase
      .from("slides")
      .insert({
        project_id: projects[0]?.id || "", // Use first project or empty
        name: "새 슬라이드",
        type: "color",
        duration_seconds: 10,
        background_color: "#000000",
        resolution_width: 1920,
        resolution_height: 1080,
        order_index: 0,
        content: {},
      })
      .select()
      .single();

    if (error || !newSlide) {
      console.error("Failed to create blank slide:", error);
      return;
    }

    // Add the new slide to the playlist
    const newSlideIds = [...playlist.slideIds, newSlide.id];
    setPlaylist({ ...playlist, slideIds: newSlideIds });

    // Also add to allSlides for immediate display
    const projectName = projects[0]?.name || "프로젝트";
    const mappedSlide = mapDbSlideToSlide(newSlide, new Map(), projectName);
    setAllSlides([...allSlides, mappedSlide]);

    // Select the new slide
    setSelectedSlideIndex(newSlideIds.length - 1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    // Calculate height from top of viewport, accounting for header (~72px)
    const headerHeight = 72;
    const newHeight = e.clientY - headerHeight;
    const clampedHeight = Math.max(200, Math.min(newHeight, window.innerHeight * 0.6));
    setPlaylistHeight(clampedHeight);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const getCurrentSlide = (): Slide | null => {
    if (!playlist || playlist.slideIds.length === 0) return null;
    const currentSlideId = playlist.slideIds[selectedSlideIndex];
    return allSlides.find((s) => s.id === currentSlideId) || null;
  };

  const currentSlide = getCurrentSlide();

  const getMediaForSlide = (slide: Slide) => {
    const fileName = slide.image || slide.video;
    if (!fileName) return null;
    return mediaByName.get(fileName) || null;
  };

  const getTotalDuration = () => {
    if (!playlist) return "0분 0초";
    const durations = playlist.slideIds
      .map((slideId) => allSlides.find((s) => s.id === slideId))
      .filter((s) => s !== undefined)
      .map((s) => (s ? s.duration : 0));
    return formatTotalDuration(durations);
  };

  if (!playlist) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">플레이리스트를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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

      <div className="flex-1 flex overflow-hidden">
        <SlideLibraryPanel
          projects={projects}
          slidesWithMedia={slidesWithMedia}
          selectedProjectId={selectedProjectFilter}
          onSelectProject={setSelectedProjectFilter}
          onDragStart={(slideId) => setDraggedSlideId(slideId)}
          onDragEnd={() => setDraggedSlideId(null)}
          isUsed={(slideId) => playlist.slideIds.includes(slideId)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className={`bg-white border-b relative transition-all ${
              draggedSlideId ? "ring-4 ring-blue-400 ring-opacity-50 bg-blue-50" : ""
            }`}
            style={{ height: `${playlistHeight}px` }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedSlideId) {
                handleDropSlideToPlaylist(draggedSlideId);
              }
              setDraggedSlideId(null);
            }}
          >
            <div
              className="absolute bottom-0 left-0 right-0 h-2 cursor-row-resize z-10"
              onMouseDown={handleMouseDown}
            />
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">플레이리스트 편집</h3>
              <div className="text-sm text-gray-500">
                {playlist.slideIds.length}개 슬라이드
              </div>
            </div>
            <div className="overflow-y-auto px-6 py-4" style={{ height: `${playlistHeight - 64}px` }}>
              {playlist.slideIds.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  슬라이드를 추가하세요
                </div>
              ) : (
                <div className="grid grid-cols-8 gap-3 xl:grid-cols-10">
                  {playlist.slideIds.map((slideId, index) => {
                    const slide = allSlides.find((s) => s.id === slideId);
                    if (!slide) return null;

                    const mediaRow = getMediaForSlide(slide);
                    const media = mediaRow ? mapDbMediaToMediaFile(mediaRow) : null;

                    return (
                      <div
                        key={`${slideId}-${index}`}
                        draggable
                        onDragStart={() => setDraggedPlaylistIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedSlideId) {
                            handleDropSlideToPlaylist(draggedSlideId, index);
                          } else if (draggedPlaylistIndex !== null) {
                            handleReorderPlaylist(draggedPlaylistIndex, index);
                          }
                          setDraggedSlideId(null);
                          setDraggedPlaylistIndex(null);
                        }}
                        onClick={() => setSelectedSlideIndex(index)}
                        className={`relative group rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                          selectedSlideIndex === index
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div
                          className="aspect-video relative"
                          style={{ backgroundColor: slide.backgroundColor }}
                        >
                          <SlideThumbnail slide={slide} media={media} />
                        </div>
                        <div className="p-2 bg-white border-t">
                          <div className="text-xs font-semibold text-gray-800 truncate">{slide.name}</div>
                          <div className="text-[11px] text-gray-500 truncate">{slide.projectName}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSlideFromPlaylist(index);
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={handleCreateBlankSlide}
                    className="aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center cursor-pointer transition-all group"
                  >
                    <div className="text-center">
                      <div className="text-4xl text-gray-400 group-hover:text-blue-500 mb-2">+</div>
                      <div className="text-xs text-gray-500 group-hover:text-blue-600">새 슬라이드</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-8 overflow-hidden">
            {playlist.slideIds.length === 0 ? (
              <div className="text-center text-gray-400">
                <p className="text-lg mb-2">플레이리스트가 비어있습니다</p>
                <p className="text-sm">왼쪽에서 슬라이드를 추가하세요</p>
              </div>
            ) : currentSlide ? (
              <div className="w-full max-w-6xl">
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    <span className="text-white font-medium">{currentSlide.name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-cyan-400 text-sm">{currentSlide.projectName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400 text-sm">{currentSlide.duration}초</span>
                  </div>
                </div>

                <div
                  className="aspect-video rounded-lg shadow-2xl relative overflow-hidden"
                  style={{ backgroundColor: currentSlide.backgroundColor }}
                >
                  <SlideThumbnail
                    slide={currentSlide}
                    media={(() => {
                      const mediaRow = getMediaForSlide(currentSlide);
                      return mediaRow ? mapDbMediaToMediaFile(mediaRow) : null;
                    })()}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
