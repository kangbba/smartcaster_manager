"use client";

import Link from "next/link";

const dummyProjects = [
  {
    id: 1,
    name: "2026 S/S 신상품 런칭",
    client: "나이키 코리아",
    mediaCount: 12,
    playlistCount: 4,
    totalSize: "248.5 MB",
    status: "active",
    createdAt: "2026-01-20",
    assignedDevices: 15,
  },
  {
    id: 2,
    name: "설 명절 특가 프로모션",
    client: "롯데백화점",
    mediaCount: 8,
    playlistCount: 3,
    totalSize: "156.3 MB",
    status: "active",
    createdAt: "2026-01-18",
    assignedDevices: 22,
  },
  {
    id: 3,
    name: "갤럭시 S26 출시 캠페인",
    client: "삼성전자",
    mediaCount: 15,
    playlistCount: 5,
    totalSize: "432.8 MB",
    status: "active",
    createdAt: "2026-01-15",
    assignedDevices: 38,
  },
];

export default function ProjectsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">프로젝트</h1>
        <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
          + 프로젝트 생성
        </button>
      </div>

      {/* 프로젝트 카드 그리드 */}
      <div className="grid grid-cols-3 gap-6">
        {dummyProjects.map((project) => (
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
                  <span className="text-gray-600">미디어</span>
                  <span className="font-semibold text-gray-800">{project.mediaCount}개</span>
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
          <div className="text-2xl font-bold text-gray-800">{dummyProjects.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">활성 프로젝트</div>
          <div className="text-2xl font-bold text-green-600">
            {dummyProjects.filter((p) => p.status === "active").length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">전체 미디어</div>
          <div className="text-2xl font-bold text-cyan-600">
            {dummyProjects.reduce((sum, p) => sum + p.mediaCount, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">전체 플레이리스트</div>
          <div className="text-2xl font-bold text-purple-600">
            {dummyProjects.reduce((sum, p) => sum + p.playlistCount, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
