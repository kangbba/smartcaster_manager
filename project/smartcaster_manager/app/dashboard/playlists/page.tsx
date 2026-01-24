"use client";

import Link from "next/link";
import { getPlaylistSummaries } from "@/lib/data/playlists";
import PlaylistPreviewGrid from "@/app/components/PlaylistPreviewGrid";

export default function PlaylistsPage() {
  const playlistSummaries = getPlaylistSummaries();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">플레이리스트</h1>
        <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
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
              <PlaylistPreviewGrid slides={playlist.previewSlides} columns={4} size="md" showNames />
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
