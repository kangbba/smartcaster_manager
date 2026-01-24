"use client";

import { useSyncExternalStore } from "react";
import { devicesData } from "@/lib/data/devices";
import { getPlaylistSummaries } from "@/lib/data/playlists";
import { getAssignments, subscribeAssignments } from "@/lib/data/assignmentsStore";

export default function DevicesPage() {
  const playlistSummaries = getPlaylistSummaries();
  const playlistById = new Map(playlistSummaries.map((p) => [p.id, p]));
  const assignmentsData = useSyncExternalStore(subscribeAssignments, getAssignments);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">단말기 목록</h1>
        <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
          + 신규 단말기 등록
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 flex gap-4">
        <select className="px-4 py-2 border rounded-lg">
          <option>전체 그룹</option>
          <option>강남점</option>
          <option>홍대점</option>
        </select>
        <select className="px-4 py-2 border rounded-lg">
          <option>전체 상태</option>
          <option>온라인</option>
          <option>오프라인</option>
        </select>
        <input
          type="text"
          placeholder="단말기 검색..."
          className="px-4 py-2 border rounded-lg flex-1"
        />
      </div>

      {/* 단말기 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">상태</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">단말기명</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">그룹</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">현재 재생 중</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">최종 접속</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {devicesData.map((device) => (
              <tr key={device.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    device.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">{device.name}</td>
                <td className="px-6 py-4 text-gray-600">{device.group}</td>
                <td className="px-6 py-4">
                  {assignmentsData[device.id] ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800">
                        {playlistById.get(assignmentsData[device.id] || 0)?.name ?? "알 수 없음"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">할당 없음</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{device.lastSeen}</td>
                <td className="px-6 py-4">
                  <button className="text-cyan-600 hover:text-cyan-700 mr-3">수정</button>
                  <button className="text-red-600 hover:text-red-700">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 통계 요약 */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">전체 단말기</div>
          <div className="text-2xl font-bold text-gray-800">4</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">온라인</div>
          <div className="text-2xl font-bold text-green-600">3</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">오프라인</div>
          <div className="text-2xl font-bold text-red-600">1</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">미할당</div>
          <div className="text-2xl font-bold text-yellow-600">1</div>
        </div>
      </div>
    </div>
  );
}
