"use client";

const dummyGroups = [
  { id: 1, name: "강남점", deviceCount: 2, playlists: ["ABB 샴푸 캠페인"] },
  { id: 2, name: "홍대점", deviceCount: 2, playlists: ["신선식품", "미할당"] },
  { id: 3, name: "신촌점", deviceCount: 0, playlists: [] },
];

export default function DeviceGroupsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">그룹 관리</h1>
        <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
          + 그룹 생성
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {dummyGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
              <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">단말기 수</span>
                <span className="font-semibold text-gray-800">{group.deviceCount}대</span>
              </div>

              <div className="border-t pt-3">
                <div className="text-sm text-gray-600 mb-2">할당된 플레이리스트</div>
                {group.playlists.length > 0 ? (
                  <ul className="space-y-1">
                    {group.playlists.map((playlist, idx) => (
                      <li key={idx} className="text-sm text-gray-800">• {playlist}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">할당 없음</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                단말기 보기
              </button>
              <button className="flex-1 px-3 py-2 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600">
                플레이리스트 할당
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
