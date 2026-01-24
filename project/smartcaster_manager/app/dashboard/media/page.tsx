"use client";

import { useState } from "react";

// 프로젝트 폴더 구조
const dummyProjects = [
  {
    id: 1,
    name: "ABB 샴푸 캠페인",
    fileCount: 4,
    totalSize: "45.2 MB",
    createdAt: "2026-01-20",
    files: [
      { id: 1, name: "샴푸_광고_30초.mp4", type: "video", size: "24.5 MB", durationSeconds: 30 },
      { id: 2, name: "샴푸_배너_메인.jpg", type: "image", size: "8.3 MB" },
      { id: 3, name: "샴푸_배너_서브.jpg", type: "image", size: "6.2 MB" },
      { id: 4, name: "프로모션_텍스트.txt", type: "text", size: "1.2 KB" },
    ]
  },
  {
    id: 2,
    name: "신선식품",
    fileCount: 3,
    totalSize: "18.5 MB",
    createdAt: "2026-01-18",
    files: [
      { id: 5, name: "야채_이미지_1.jpg", type: "image", size: "8.2 MB" },
      { id: 6, name: "야채_이미지_2.jpg", type: "image", size: "9.8 MB" },
      { id: 7, name: "할인_안내.txt", type: "text", size: "0.5 KB" },
    ]
  },
  {
    id: 3,
    name: "주말 특가",
    fileCount: 1,
    totalSize: "32.1 MB",
    createdAt: "2026-01-15",
    files: [
      { id: 8, name: "특가_영상.mp4", type: "video", size: "32.1 MB", durationSeconds: 45 },
    ]
  },
];

export default function MediaPage() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const currentProject = selectedProject
    ? dummyProjects.find(p => p.id === selectedProject)
    : null;

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video": return "🎥";
      case "image": return "🖼️";
      case "text": return "📝";
      default: return "📄";
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">미디어 라이브러리</h1>
          {/* 브레드크럼 */}
          {currentProject && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <button
                onClick={() => setSelectedProject(null)}
                className="hover:text-cyan-600"
              >
                전체 프로젝트
              </button>
              <span>/</span>
              <span className="text-gray-800 font-semibold">{currentProject.name}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {selectedProject ? (
            <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
              + 파일 업로드
            </button>
          ) : (
            <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
              + 프로젝트 폴더 생성
            </button>
          )}
        </div>
      </div>

      {/* 프로젝트 폴더 뷰 */}
      {!selectedProject && (
        <div>
          <div className="grid grid-cols-4 gap-6">
            {dummyProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
              >
                {/* 폴더 아이콘 */}
                <div className="h-40 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                  <div className="text-8xl">📁</div>
                </div>

                {/* 폴더 정보 */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 truncate" title={project.name}>
                    {project.name}
                  </h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>파일</span>
                      <span className="font-semibold">{project.fileCount}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span>크기</span>
                      <span className="font-semibold">{project.totalSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>생성일</span>
                      <span>{project.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 통계 */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">전체 프로젝트</div>
              <div className="text-2xl font-bold text-gray-800">{dummyProjects.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">전체 파일</div>
              <div className="text-2xl font-bold text-cyan-600">
                {dummyProjects.reduce((sum, p) => sum + p.fileCount, 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">총 용량</div>
              <div className="text-2xl font-bold text-purple-600">95.8 MB</div>
            </div>
          </div>
        </div>
      )}

      {/* 프로젝트 내부 파일 뷰 */}
      {currentProject && (
        <div>
          {/* 프로젝트 정보 헤더 */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{currentProject.name}</h2>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span>파일 {currentProject.fileCount}개</span>
                  <span>총 {currentProject.totalSize}</span>
                  <span>생성일 {currentProject.createdAt}</span>
                </div>
              </div>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50">
                프로젝트 삭제
              </button>
            </div>
          </div>

          {/* 파일 목록 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">파일명</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">타입</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">크기</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">재생시간</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentProject.files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileIcon(file.type)}</span>
                        <span className="font-medium text-gray-800">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {file.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{file.size}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {"durationSeconds" in file
                        ? `${Math.floor(file.durationSeconds / 60)}:${String(file.durationSeconds % 60).padStart(2, "0")}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-cyan-600 hover:text-cyan-700 mr-3">미리보기</button>
                      <button className="text-red-600 hover:text-red-700">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
