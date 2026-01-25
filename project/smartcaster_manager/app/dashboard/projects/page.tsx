"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

type ProjectCard = {
  id: string;
  name: string;
  client: string;
  mediaCount: number;
  playlistCount: number;
  totalSize: string;
  status: "active" | "draft";
  createdAt: string;
  assignedDevices: number;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [slideCounts, setSlideCounts] = useState<Record<string, number>>({});
  const [playlistCounts, setPlaylistCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const projectCards = useMemo<ProjectCard[]>(
    () =>
      projects.map((project) => ({
        id: project.id,
        name: project.name,
        client: project.description || "미정",
        mediaCount: 0,
        playlistCount: playlistCounts[project.id] || 0,
        totalSize: "0 MB",
        status: "active",
        createdAt: project.created_at?.slice(0, 10) || "",
        assignedDevices: 0,
      })),
    [projects, playlistCounts]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: projectData } = await supabase
        .from("projects")
        .select("id,name,description,created_at")
        .order("created_at", { ascending: false });

      const { data: slideData } = await supabase
        .from("slides")
        .select("project_id");

      const { data: playlistItemData } = await supabase
        .from("playlist_items")
        .select("project_id,playlist_id");

      const slideCountMap: Record<string, number> = {};
      (slideData || []).forEach((row) => {
        if (!row.project_id) return;
        slideCountMap[row.project_id] = (slideCountMap[row.project_id] || 0) + 1;
      });

      const playlistCountMap: Record<string, Set<string>> = {};
      (playlistItemData || []).forEach((row) => {
        if (!row.project_id || !row.playlist_id) return;
        if (!playlistCountMap[row.project_id]) {
          playlistCountMap[row.project_id] = new Set();
        }
        playlistCountMap[row.project_id].add(row.playlist_id);
      });

      const playlistCountFlat: Record<string, number> = {};
      Object.keys(playlistCountMap).forEach((projectId) => {
        playlistCountFlat[projectId] = playlistCountMap[projectId].size;
      });

      setProjects(projectData || []);
      setSlideCounts(slideCountMap);
      setPlaylistCounts(playlistCountFlat);
      setLoading(false);
    };

    void load();
  }, []);

  const handleCreateProject = async () => {
    const name = window.prompt("프로젝트 이름을 입력하세요.");
    if (!name) return;
    const description = window.prompt("프로젝트 설명 (선택)");
    const { data, error } = await supabase
      .from("projects")
      .insert({ name, description: description || null })
      .select("id,name,description,created_at")
      .single();
    if (error || !data) return;
    setProjects((prev) => [data, ...prev]);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">프로젝트</h1>
        <button
          onClick={handleCreateProject}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          + 프로젝트 생성
        </button>
      </div>

      {/* 프로젝트 카드 그리드 */}
      <div className="grid grid-cols-3 gap-6">
        {projectCards.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}`}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl hover:scale-105 transition-all"
          >
            {/* 프로젝트 헤더 */}
            <div className="h-32 bg-gradient-to-br from-cyan-100 to-blue-200 flex items-center justify-center">
              <div className="text-7xl">📁</div>
            </div>

            {/* 프로젝트 정보 */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.client}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    project.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {project.status === "active" ? "활성" : "임시"}
                </span>
              </div>

              {/* 통계 */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">슬라이드</span>
                  <span className="font-semibold text-gray-800">
                    {slideCounts[project.id] || 0}개
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">플레이리스트</span>
                  <span className="font-semibold text-gray-800">{project.playlistCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">할당된 단말기</span>
                  <span className="font-semibold text-cyan-600">{project.assignedDevices}대</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">용량</span>
                  <span className="font-semibold text-gray-800">{project.totalSize}</span>
                </div>
              </div>

              {/* 생성일 */}
              <div className="pt-3 border-t text-xs text-gray-500">
                생성일: {project.createdAt}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 전체 통계 */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">전체 프로젝트</div>
          <div className="text-2xl font-bold text-gray-800">{projectCards.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">활성 프로젝트</div>
          <div className="text-2xl font-bold text-green-600">
            {projectCards.filter((p) => p.status === "active").length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">전체 슬라이드</div>
          <div className="text-2xl font-bold text-cyan-600">
            {Object.values(slideCounts).reduce((sum, count) => sum + count, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">전체 플레이리스트</div>
          <div className="text-2xl font-bold text-purple-600">
            {Object.values(playlistCounts).reduce((sum, count) => sum + count, 0)}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-sm text-gray-500">프로젝트 불러오는 중...</div>
      )}
    </div>
  );
}
