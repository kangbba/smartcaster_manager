"use client";

import { useState } from "react";

// 타입 정의
type Assignment = {
  id: string;
  deviceId: string;
  deviceName: string;
  playlistId: string;
  playlistName: string;
  projectName: string;
  isLive: boolean;
  priority: number;
  createdAt: string;
};

// 더미 데이터
const assignmentsData: Assignment[] = [
  {
    id: "assign_001",
    deviceId: "dev_001",
    deviceName: "명동-플래그십-1F-메인",
    playlistId: "pl_001",
    playlistName: "영상+이미지 조합 광고",
    projectName: "2026 S/S 신상품 런칭 (나이키)",
    isLive: true,
    priority: 1,
    createdAt: "2026-01-21",
  },
  {
    id: "assign_002",
    deviceId: "dev_002",
    deviceName: "명동-플래그십-2F-메인",
    playlistId: "pl_001",
    playlistName: "영상+이미지 조합 광고",
    projectName: "2026 S/S 신상품 런칭 (나이키)",
    isLive: true,
    priority: 1,
    createdAt: "2026-01-21",
  },
  {
    id: "assign_003",
    deviceId: "dev_003",
    deviceName: "강남점-입구-좌측",
    playlistId: "pl_002",
    playlistName: "30초 영상만 송출",
    projectName: "2026 S/S 신상품 런칭 (나이키)",
    isLive: true,
    priority: 1,
    createdAt: "2026-01-21",
  },
  {
    id: "assign_004",
    deviceId: "dev_004",
    deviceName: "홍대점-1F-A",
    playlistId: "pl_003",
    playlistName: "제품 이미지만 슬라이드",
    projectName: "2026 S/S 신상품 런칭 (나이키)",
    isLive: false,
    priority: 1,
    createdAt: "2026-01-21",
  },
  {
    id: "assign_005",
    deviceId: "dev_005",
    deviceName: "본점-1F-메인홀-중앙",
    playlistId: "pl_005",
    playlistName: "영상+이미지 혼합 광고",
    projectName: "설 명절 특가 프로모션 (롯데백화점)",
    isLive: true,
    priority: 1,
    createdAt: "2026-01-19",
  },
];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(assignmentsData);
  const [filter, setFilter] = useState<"all" | "live" | "off">("all");

  // 라이브 토글
  const handleToggleLive = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    // 라이브 켤 때는 확인 팝업
    if (!assignment.isLive) {
      const confirmed = window.confirm(
        `"${assignment.playlistName}"을(를) "${assignment.deviceName}" 기기에 송출하시겠습니까?\n\n라이브를 시작하면 즉시 단말기에 표시됩니다.`
      );
      if (!confirmed) return;
    }

    setAssignments(assignments.map(a =>
      a.id === assignmentId ? { ...a, isLive: !a.isLive } : a
    ));
  };

  // 할당 삭제
  const handleDeleteAssignment = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const confirmed = window.confirm(
      `"${assignment.deviceName}"의 할당을 삭제하시겠습니까?`
    );
    if (!confirmed) return;

    setAssignments(assignments.filter(a => a.id !== assignmentId));
  };

  // 필터링된 할당 목록
  const filteredAssignments = assignments.filter(a => {
    if (filter === "live") return a.isLive;
    if (filter === "off") return !a.isLive;
    return true;
  });

  // 통계
  const stats = {
    total: assignments.length,
    live: assignments.filter(a => a.isLive).length,
    off: assignments.filter(a => !a.isLive).length,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">송출 관리</h1>
        <p className="text-gray-600">플레이리스트를 기기에 할당하고 라이브 상태를 관리합니다.</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">전체 할당</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">라이브 중</div>
          <div className="text-2xl font-bold text-red-600">{stats.live}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">라이브 꺼짐</div>
          <div className="text-2xl font-bold text-gray-600">{stats.off}</div>
        </div>
      </div>

      {/* 필터 및 액션 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === "all"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              전체 ({stats.total})
            </button>
            <button
              onClick={() => setFilter("live")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === "live"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              라이브 중 ({stats.live})
            </button>
            <button
              onClick={() => setFilter("off")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === "off"
                  ? "bg-gray-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              라이브 꺼짐 ({stats.off})
            </button>
          </div>

          <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold">
            + 새 할당 추가
          </button>
        </div>

        {/* 할당 목록 */}
        <div className="divide-y">
          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              할당이 없습니다
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        assignment.isLive
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {assignment.isLive ? "● 라이브 중" : "○ 라이브 꺼짐"}
                      </span>
                      <span className="text-xs text-gray-500">우선순위 {assignment.priority}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">기기</div>
                        <div className="font-semibold text-gray-800">🖥️ {assignment.deviceName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">플레이리스트</div>
                        <div className="font-semibold text-gray-800">📺 {assignment.playlistName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">프로젝트</div>
                        <div className="text-sm text-gray-600">{assignment.projectName}</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 mt-2">
                      할당일: {assignment.createdAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-6">
                    {/* 라이브 토글 */}
                    <button
                      onClick={() => handleToggleLive(assignment.id)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        assignment.isLive
                          ? "bg-red-500"
                          : "bg-gray-300"
                      }`}
                      title="라이브 on/off"
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          assignment.isLive
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="할당 삭제"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
