"use client";

import Link from "next/link";

const dummyPlaylists = [
  {
    id: "pl_001",
    name: "ABB 샴푸 캠페인",
    template: "1920x1080 4존",
    mediaCount: 4,
    devices: ["강남점-3층-A", "강남점-3층-B"],
    status: "active",
    createdAt: "2026-01-20",
  },
  {
    id: "pl_002",
    name: "신선식품",
    template: "1920x1080 2존",
    mediaCount: 2,
    devices: ["홍대점-1층"],
    status: "active",
    createdAt: "2026-01-18",
  },
  {
    id: "pl_003",
    name: "주말 특가",
    template: "1080x1920 세로",
    mediaCount: 3,
    devices: [],
    status: "draft",
    createdAt: "2026-01-15",
  },
];

export default function PlaylistsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">플레이리스트</h1>
        <Link
          href="/dashboard/playlists/create"
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          + 플레이리스트 생성
        </Link>
      </div>

      {/* 플레이리스트 목록 */}
      <div className="space-y-4">
        {dummyPlaylists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    {playlist.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      playlist.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {playlist.status === "active" ? "송출 중" : "임시저장"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-semibold">템플릿:</span> {playlist.template}
                  </div>
                  <div>
                    <span className="font-semibold">미디어:</span> {playlist.mediaCount}개
                  </div>
                  <div>
                    <span className="font-semibold">생성일:</span> {playlist.createdAt}
                  </div>
                </div>

                {/* 송출 중인 단말기 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    송출 중인 단말기:
                  </span>
                  {playlist.devices.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {playlist.devices.map((device, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded"
                        >
                          {device}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">할당 없음</span>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-col gap-2 ml-6">
                <Link
                  href={`/dashboard/playlists/${playlist.id}`}
                  className="px-4 py-2 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600 text-center"
                >
                  수정
                </Link>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                  복사
                </button>
                <button className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded hover:bg-red-50">
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
