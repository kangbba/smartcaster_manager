"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import PlaylistPreviewGrid, { type PreviewSlideData } from "@/app/components/PlaylistPreviewGrid";
import { formatTotalDuration } from "@/lib/utils/formatting";
import { mapDbSlideToSlide, mapDbMediaToMediaFile } from "@/lib/data/mappers";
import type { MediaRow, SlideRow } from "@/lib/types/database";

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

export default function PlaylistsPage() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<PlaylistRow[]>([]);
  const [playlistItems, setPlaylistItems] = useState<PlaylistItemRow[]>([]);
  const [slides, setSlides] = useState<SlideRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [media, setMedia] = useState<MediaRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: playlistData } = await supabase
        .from("playlists")
        .select("id,name,description,created_at")
        .order("created_at", { ascending: false });
      const { data: playlistItemData } = await supabase
        .from("playlist_items")
        .select("playlist_id,slide_id,order_index");
      const { data: slideData } = await supabase
        .from("slides")
        .select("id,project_id,background_color,duration_seconds,media_id,content,name");
      const { data: projectData } = await supabase
        .from("projects")
        .select("id,name");
      const { data: mediaData } = await supabase
        .from("media")
        .select("id,type");

      setPlaylists((playlistData as PlaylistRow[]) || []);
      setPlaylistItems((playlistItemData as PlaylistItemRow[]) || []);
      setSlides((slideData as SlideRow[]) || []);
      setProjects((projectData as ProjectRow[]) || []);
      setMedia((mediaData as MediaRow[]) || []);
    };

    void load();
  }, []);

  const playlistSummaries = useMemo(() => {
    const projectById = new Map(projects.map((p) => [p.id, p.name]));
    const slideById = new Map(slides.map((s) => [s.id, s]));
    const mediaByIdMap = new Map(media.map((m) => [m.id, m]));

    return playlists.map((playlist) => {
      const items = playlistItems
        .filter((item) => item.playlist_id === playlist.id)
        .sort((a, b) => a.order_index - b.order_index);

      const slideList = items
        .map((item) => slideById.get(item.slide_id))
        .filter(Boolean) as SlideRow[];

      const projectsUsed = Array.from(
        new Set(slideList.map((s) => projectById.get(s.project_id) || "프로젝트"))
      );

      const durations = slideList.map((s) => s.duration_seconds || 0);

      const previewSlides: PreviewSlideData[] = slideList.slice(0, 8).map((slideRow) => {
        const projectName = projectById.get(slideRow.project_id) || "프로젝트";
        const slide = mapDbSlideToSlide(slideRow, mediaByIdMap, projectName);
        const mediaRow = slideRow.media_id ? media.find(m => m.id === slideRow.media_id) : null;
        const mediaFile = mediaRow ? mapDbMediaToMediaFile(mediaRow) : null;
        return {
          slide,
          media: mediaFile,
        };
      });

      return {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || "",
        slideCount: items.length,
        totalDuration: formatTotalDuration(durations),
        projects: projectsUsed,
        status: "active" as const,
        createdAt: playlist.created_at?.slice(0, 10) || "",
        assignedDevices: 0,
        previewSlides,
      };
    });
  }, [playlists, playlistItems, slides, projects, media]);

  const handleCreatePlaylist = async () => {
    const name = window.prompt("플레이리스트 이름을 입력하세요.");
    if (!name) return;
    const description = window.prompt("설명 (선택)");
    const { data, error } = await supabase
      .from("playlists")
      .insert({ name, description: description || null })
      .select("id")
      .single();
    if (error || !data) return;
    router.push(`/dashboard/playlists/${data.id}`);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">플레이리스트</h1>
        <button
          onClick={handleCreatePlaylist}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          + 플레이리스트 생성
        </button>
      </div>

      {/* 안내 메시지 */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>플레이리스트</strong>는 여러 프로젝트의 슬라이드를 조합하여 만들 수 있습니다.
          생성된 플레이리스트는 송출 관리에서 단말기에 배치할 수 있습니다.
        </p>
      </div>

      {/* 플레이리스트 카드 그리드 */}
      <div className="grid grid-cols-3 gap-6">
        {playlistSummaries.map((playlist) => (
          <Link
            key={playlist.id}
            href={`/dashboard/playlists/${playlist.id}`}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl hover:scale-105 transition-all"
          >
            {/* 플레이리스트 헤더 */}
            <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-200 p-4">
              <PlaylistPreviewGrid slides={playlist.previewSlides} columns={4} />
            </div>

            {/* 플레이리스트 정보 */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{playlist.name}</h3>
                  <p className="text-sm text-gray-600">{playlist.description}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    playlist.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {playlist.status === "active" ? "활성" : "임시"}
                </span>
              </div>

              {/* 포함된 프로젝트 */}
              <div className="mb-4">
                <div className="text-xs text-gray-600 mb-1.5">포함된 프로젝트</div>
                <div className="flex flex-wrap gap-1.5">
                  {playlist.projects.map((project, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded border border-cyan-200"
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </div>

              {/* 통계 */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">슬라이드</span>
                  <span className="font-semibold text-gray-800">{playlist.slideCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 재생시간</span>
                  <span className="font-semibold text-gray-800">{playlist.totalDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">할당된 단말기</span>
                  <span className="font-semibold text-cyan-600">{playlist.assignedDevices}대</span>
                </div>
              </div>

              {/* 생성일 */}
              <div className="pt-3 border-t text-xs text-gray-500">
                생성일: {playlist.createdAt}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 전체 통계 */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">전체 플레이리스트</div>
          <div className="text-2xl font-bold text-gray-800">{playlistSummaries.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">활성 플레이리스트</div>
          <div className="text-2xl font-bold text-green-600">
            {playlistSummaries.filter((p) => p.status === "active").length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">전체 슬라이드</div>
          <div className="text-2xl font-bold text-purple-600">
            {playlistSummaries.reduce((sum, p) => sum + p.slideCount, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">배치된 단말기</div>
          <div className="text-2xl font-bold text-cyan-600">
            {playlistSummaries.reduce((sum, p) => sum + p.assignedDevices, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
