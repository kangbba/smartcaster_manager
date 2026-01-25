"use client";

import { useEffect, useMemo, useSyncExternalStore, useState } from "react";
import { getAssignments, subscribeAssignments } from "@/lib/data/assignmentsStore";
import { supabase } from "@/lib/supabase/client";

type DeviceRequest = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  userCompany: string | null;
  deviceUuid: string;
  deviceModel: string;
  deviceResolution: string;
  requestedAt: string;
};

type ApprovedDevice = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  userCompany: string | null;
  name: string;
  group: string;
  status: "online" | "offline";
  lastSeen: string;
  model: string;
  resolution: string;
  registeredDate: string;
};

export default function DevicesPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "devices">("requests");
  const [deviceRequests, setDeviceRequests] = useState<DeviceRequest[]>([]);
  const [devices, setDevices] = useState<ApprovedDevice[]>([]);
  const [playlistSummaries, setPlaylistSummaries] = useState<Array<{ id: string; name: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const playlistById = useMemo(
    () => new Map(playlistSummaries.map((p) => [p.id, p])),
    [playlistSummaries]
  );
  const assignmentsData = useSyncExternalStore(subscribeAssignments, getAssignments, getAssignments);

  useEffect(() => {
    const load = async () => {
      // TODO: Supabase에서 device_requests, devices 가져오기
      // 현재는 더미 데이터 사용
      const dummyRequests: DeviceRequest[] = [
        {
          id: "req_001",
          userId: "user_003",
          userEmail: "chulsoo.kim@example.com",
          userName: "김철수",
          userCompany: "스타벅스 강남점",
          deviceUuid: "LCD-A3F8-2B91-44E2",
          deviceModel: "SmartCaster Pro 43",
          deviceResolution: "1920x1080",
          requestedAt: "2026-01-22 14:30",
        },
        {
          id: "req_002",
          userId: "user_002",
          userEmail: "gj.choi@example.com",
          userName: "최과장",
          userCompany: "롯데백화점 본점",
          deviceUuid: "LCD-B7C4-5D32-88F1",
          deviceModel: "SmartCaster Ultra 55",
          deviceResolution: "3840x2160",
          requestedAt: "2026-01-23 10:15",
        },
      ];

      const dummyDevices: ApprovedDevice[] = [
        {
          id: "dev_001",
          userId: "user_001",
          userEmail: "dae.jung@example.com",
          userName: "정대리",
          userCompany: "현대백화점 압구정점",
          name: "1920x1080-A1F8",
          group: "현대백화점 압구정점",
          status: "online",
          lastSeen: "2026-01-22 14:30",
          model: "SmartCaster Pro 43",
          resolution: "1920x1080",
          registeredDate: "2026-01-15",
        },
        {
          id: "dev_002",
          userId: "user_001",
          userEmail: "dae.jung@example.com",
          userName: "정대리",
          userCompany: "현대백화점 압구정점",
          name: "1920x1080-B2C9",
          group: "현대백화점 압구정점",
          status: "online",
          lastSeen: "2026-01-22 14:29",
          model: "SmartCaster Pro 43",
          resolution: "1920x1080",
          registeredDate: "2026-01-15",
        },
        {
          id: "dev_003",
          userId: "user_002",
          userEmail: "gj.choi@example.com",
          userName: "최과장",
          userCompany: "롯데백화점 본점",
          name: "3840x2160-C3D4",
          group: "롯데백화점 본점",
          status: "online",
          lastSeen: "2026-01-22 12:10",
          model: "SmartCaster Ultra 55",
          resolution: "3840x2160",
          registeredDate: "2026-01-16",
        },
      ];

      setDeviceRequests(dummyRequests);
      setDevices(dummyDevices);

      const { data } = await supabase
        .from("playlists")
        .select("id,name")
        .order("created_at", { ascending: false });
      setPlaylistSummaries((data as Array<{ id: string; name: string }>) || []);
    };

    void load();
  }, []);

  const handleApprove = (requestId: string) => {
    const request = deviceRequests.find((r) => r.id === requestId);
    if (!request) return;

    // 요청 목록에서 제거
    setDeviceRequests(deviceRequests.filter((r) => r.id !== requestId));

    // 기기명 자동 생성: 해상도-UUID 마지막 4자리
    const uuidSuffix = request.deviceUuid.split("-").pop() || "XXXX";
    const deviceName = `${request.deviceResolution}-${uuidSuffix.toUpperCase()}`;

    // 승인된 기기 목록에 추가
    const newDevice: ApprovedDevice = {
      id: `dev_${Date.now()}`,
      userId: request.userId,
      userEmail: request.userEmail,
      userName: request.userName,
      userCompany: request.userCompany,
      name: deviceName,
      group: request.userCompany || "미분류",
      status: "offline",
      lastSeen: "-",
      model: request.deviceModel,
      resolution: request.deviceResolution,
      registeredDate: new Date().toISOString().split("T")[0],
    };
    setDevices([newDevice, ...devices]);
  };

  const handleReject = (requestId: string) => {
    setDeviceRequests(deviceRequests.filter((r) => r.id !== requestId));
  };

  const getAspectRatioInfo = (resolution: string) => {
    const [widthStr, heightStr] = resolution.split("x");
    const width = parseInt(widthStr) || 1920;
    const height = parseInt(heightStr) || 1080;
    const ratio = width / height;

    // 비율에 따라 모니터 모양 결정
    if (ratio > 1.6) {
      // 16:9, 21:9 등 (가로로 매우 긴 화면)
      return { shape: "landscape", width: 40, height: 24 };
    } else if (ratio > 1.2) {
      // 16:10, 3:2 등 (가로로 약간 긴 화면)
      return { shape: "landscape-narrow", width: 40, height: 28 };
    } else if (ratio > 0.9 && ratio < 1.1) {
      // 1:1 (정사각형)
      return { shape: "square", width: 32, height: 32 };
    } else if (ratio < 0.7) {
      // 9:16 등 (세로로 긴 화면)
      return { shape: "portrait", width: 24, height: 40 };
    } else {
      // 기타
      return { shape: "portrait-narrow", width: 28, height: 40 };
    }
  };

  // 검색 필터링
  const filteredDeviceRequests = useMemo(() => {
    if (!searchQuery.trim()) return deviceRequests;
    const query = searchQuery.toLowerCase();
    return deviceRequests.filter((req) =>
      req.deviceModel.toLowerCase().includes(query) ||
      req.deviceResolution.toLowerCase().includes(query) ||
      req.deviceUuid.toLowerCase().includes(query) ||
      req.userName?.toLowerCase().includes(query) ||
      req.userEmail.toLowerCase().includes(query) ||
      req.userCompany?.toLowerCase().includes(query)
    );
  }, [deviceRequests, searchQuery]);

  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) return devices;
    const query = searchQuery.toLowerCase();
    return devices.filter((dev) =>
      dev.name.toLowerCase().includes(query) ||
      dev.model.toLowerCase().includes(query) ||
      dev.resolution.toLowerCase().includes(query) ||
      dev.group.toLowerCase().includes(query) ||
      dev.userName?.toLowerCase().includes(query) ||
      dev.userEmail.toLowerCase().includes(query) ||
      dev.userCompany?.toLowerCase().includes(query)
    );
  }, [devices, searchQuery]);

  const onlineCount = devices.filter((d) => d.status === "online").length;
  const offlineCount = devices.filter((d) => d.status === "offline").length;
  const unassignedCount = devices.filter((d) => !assignmentsData[d.id]).length;

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">기기 관리</h1>
        <p className="text-gray-600 mt-1">회원의 기기 요청 승인 및 기기 관리</p>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">대기 중인 요청</div>
          <div className="text-2xl font-bold text-yellow-600">{deviceRequests.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">전체 기기</div>
          <div className="text-2xl font-bold text-gray-800">{devices.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">온라인</div>
          <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">오프라인</div>
          <div className="text-2xl font-bold text-red-600">{offlineCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">미할당</div>
          <div className="text-2xl font-bold text-yellow-600">{unassignedCount}</div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "requests"
              ? "bg-cyan-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          기기 요청 {deviceRequests.length > 0 && `(${deviceRequests.length})`}
        </button>
        <button
          onClick={() => setActiveTab("devices")}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "devices"
              ? "bg-cyan-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          승인된 기기 ({devices.length})
        </button>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="기기명, 모델, 해상도, 소유자 이름, 이메일, 회사 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* 기기 요청 탭 */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {filteredDeviceRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500">
                {searchQuery.trim() ? "검색 결과가 없습니다" : "대기 중인 기기 요청이 없습니다"}
              </p>
            </div>
          ) : (
            filteredDeviceRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 기기 정보 - 메인 */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* 화면 비율 시각화 */}
                      <div className="flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg p-3" style={{ width: '80px', height: '80px' }}>
                        <div
                          className="bg-gray-900 rounded shadow-sm"
                          style={{
                            width: `${getAspectRatioInfo(request.deviceResolution).width}px`,
                            height: `${getAspectRatioInfo(request.deviceResolution).height}px`,
                          }}
                        ></div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-800">{request.deviceModel}</h3>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded">
                            승인 대기
                          </span>
                        </div>
                        <div className="font-mono text-sm text-gray-500 mb-2">{request.deviceUuid}</div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">해상도:</span>{" "}
                            <span className="font-semibold text-gray-800">{request.deviceResolution}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">요청:</span>{" "}
                            <span className="font-semibold text-gray-800">{request.requestedAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 소유자 정보 */}
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">소유자</div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">이름</div>
                          <div className="text-base font-bold text-gray-900">{request.userName || "-"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">이메일</div>
                          <div className="text-sm text-gray-800">{request.userEmail}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">회사/매장</div>
                          <div className="text-sm font-semibold text-gray-800">{request.userCompany || "-"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-6">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                    >
                      ✓ 승인
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                    >
                      ✕ 거부
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 승인된 기기 탭 */}
      {activeTab === "devices" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">기기명 / 그룹</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">모델 / 해상도</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">소유자</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">현재 재생 중</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">최종 접속</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery.trim() ? "검색 결과가 없습니다" : "승인된 기기가 없습니다"}
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${
                          device.status === "online" ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-base">{device.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{device.group} • 등록: {device.registeredDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* 화면 비율 시각화 */}
                        <div className="flex-shrink-0 flex items-center justify-center bg-gray-100 rounded p-2" style={{ width: '48px', height: '48px' }}>
                          <div
                            className="bg-gray-900 rounded shadow-sm"
                            style={{
                              width: `${Math.min(getAspectRatioInfo(device.resolution).width * 0.6, 32)}px`,
                              height: `${Math.min(getAspectRatioInfo(device.resolution).height * 0.6, 32)}px`,
                            }}
                          ></div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{device.model}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{device.resolution}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{device.userName || "-"}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{device.userEmail}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{device.userCompany}</div>
                    </td>
                    <td className="px-6 py-4">
                      {assignmentsData[device.id] ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-800">
                            {playlistById.get(assignmentsData[device.id] || "")?.name ?? "알 수 없음"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">할당 없음</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{device.lastSeen}</td>
                    <td className="px-6 py-4">
                      <button className="text-cyan-600 hover:text-cyan-700 text-sm">상세보기</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
