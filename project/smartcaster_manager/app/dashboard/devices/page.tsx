"use client";

// Dummy 데이터
const dummyDevices = [
  {
    id: 1,
    name: "강남점-3층-A",
    group: "강남점",
    status: "online",
    lastSeen: "2026-01-22 14:30",
    currentPlaylist: "ABB 샴푸 캠페인",
    playlistId: "pl_001"
  },
  {
    id: 2,
    name: "강남점-3층-B",
    group: "강남점",
    status: "online",
    lastSeen: "2026-01-22 14:29",
    currentPlaylist: "ABB 샴푸 캠페인",
    playlistId: "pl_001"
  },
  {
    id: 3,
    name: "홍대점-1층",
    group: "홍대점",
    status: "offline",
    lastSeen: "2026-01-22 10:15",
    currentPlaylist: "신선식품",
    playlistId: "pl_002"
  },
  {
    id: 4,
    name: "홍대점-2층",
    group: "홍대점",
    status: "online",
    lastSeen: "2026-01-22 14:31",
    currentPlaylist: null,
    playlistId: null
  },
];

export default function DevicesPage() {
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
            {dummyDevices.map((device) => (
              <tr key={device.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    device.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">{device.name}</td>
                <td className="px-6 py-4 text-gray-600">{device.group}</td>
                <td className="px-6 py-4">
                  {device.currentPlaylist ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800">{device.currentPlaylist}</span>
                      <button className="text-xs text-cyan-600 hover:text-cyan-700">
                        상세 →
                      </button>
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
