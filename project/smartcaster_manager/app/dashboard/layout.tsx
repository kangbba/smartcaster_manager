"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [playerOpen, setPlayerOpen] = useState(true);
  const [contentsOpen, setContentsOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 좌측 사이드바 */}
      <aside className="w-64 bg-gray-200 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-800">SmartCaster</h1>
          <p className="text-sm text-gray-600">Advertisement Management System</p>
        </div>

        <nav className="space-y-1">
          {/* 대시보드 */}
          <Link
            href="/dashboard"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              pathname === "/dashboard"
                ? "bg-cyan-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📊 대시보드
          </Link>

          {/* 단말기 */}
          <div>
            <button
              onClick={() => setPlayerOpen(!playerOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span>🖥️ 단말기</span>
              <span className="text-sm">{playerOpen ? "▼" : "▶"}</span>
            </button>
            {playerOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <Link
                  href="/dashboard/devices"
                  className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                    pathname === "/dashboard/devices"
                      ? "bg-cyan-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  단말기 목록
                </Link>
              </div>
            )}
          </div>

          {/* 프로젝트 */}
          <Link
            href="/dashboard/projects"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              pathname.startsWith("/dashboard/projects")
                ? "bg-cyan-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📁 프로젝트
          </Link>

          {/* 플레이리스트 */}
          <Link
            href="/dashboard/playlists"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              pathname.startsWith("/dashboard/playlists")
                ? "bg-cyan-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🎬 플레이리스트
          </Link>

          {/* 송출 관리 */}
          <Link
            href="/dashboard/assignments"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              pathname.startsWith("/dashboard/assignments")
                ? "bg-cyan-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📡 송출 관리
          </Link>

          {/* 회원 관리 */}
          <Link
            href="/dashboard/members"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              pathname.startsWith("/dashboard/members")
                ? "bg-cyan-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            👥 회원 관리
          </Link>
        </nav>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
