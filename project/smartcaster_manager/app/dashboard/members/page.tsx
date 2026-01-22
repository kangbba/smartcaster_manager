"use client";

import { useState } from "react";

type Device = {
  uuid: string;
  model: string;
  resolution: string;
  registeredDate: string;
  lastOnline: string;
  status: "online" | "offline";
};

type MemberRequest = {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  requestDate: string;
  device: {
    uuid: string;
    model: string;
    resolution: string;
  };
};

type ApprovedMember = {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  approvedDate: string;
  devices: Device[];
  lastLoginDate: string;
  status: "active" | "inactive";
};

type RejectedMember = {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  requestDate: string;
  rejectedDate: string;
  rejectedReason?: string;
  device: {
    uuid: string;
    model: string;
    resolution: string;
  };
};

// Dummy 데이터
const initialRequests: MemberRequest[] = [
  {
    id: 1,
    name: "김철수",
    email: "chulsoo.kim@example.com",
    company: "스타벅스 강남점",
    phone: "010-1234-5678",
    requestDate: "2026-01-22",
    device: {
      uuid: "LCD-A3F8-2B91-44E2",
      model: "SmartCaster Pro 43",
      resolution: "1920x1080",
    },
  },
  {
    id: 2,
    name: "이영희",
    email: "younghee.lee@example.com",
    company: "롯데백화점 본점",
    phone: "010-2345-6789",
    requestDate: "2026-01-22",
    device: {
      uuid: "LCD-B7C4-5D32-88F1",
      model: "SmartCaster Ultra 55",
      resolution: "3840x2160",
    },
  },
  {
    id: 3,
    name: "박민수",
    email: "minsoo.park@example.com",
    company: "나이키 명동점",
    phone: "010-3456-7890",
    requestDate: "2026-01-21",
    device: {
      uuid: "LCD-C2D9-7A45-99B3",
      model: "SmartCaster Pro 43",
      resolution: "1920x1080",
    },
  },
];

const initialMembers: ApprovedMember[] = [
  {
    id: 101,
    name: "정대리",
    email: "dae.jung@example.com",
    company: "현대백화점 압구정점",
    phone: "010-1111-2222",
    approvedDate: "2026-01-15",
    devices: [
      { uuid: "LCD-D4E5-1A23-77C8", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2026-01-15", lastOnline: "2026-01-22 14:30", status: "online" },
      { uuid: "LCD-D4E5-1A23-77C9", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2026-01-15", lastOnline: "2026-01-22 14:28", status: "online" },
      { uuid: "LCD-D4E5-1A23-77CA", model: "SmartCaster Ultra 55", resolution: "3840x2160", registeredDate: "2026-01-16", lastOnline: "2026-01-22 14:25", status: "online" },
      { uuid: "LCD-D4E5-1A23-77CB", model: "SmartCaster Slim 32", resolution: "1366x768", registeredDate: "2026-01-17", lastOnline: "2026-01-21 18:45", status: "offline" },
      { uuid: "LCD-D4E5-1A23-77CC", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2026-01-18", lastOnline: "2026-01-22 14:32", status: "online" },
    ],
    lastLoginDate: "2026-01-22",
    status: "active",
  },
  {
    id: 102,
    name: "최과장",
    email: "gj.choi@example.com",
    company: "삼성전자 강남대리점",
    phone: "010-3333-4444",
    approvedDate: "2026-01-10",
    devices: [
      { uuid: "LCD-E5F6-2B34-88D9", model: "SmartCaster Ultra 55", resolution: "3840x2160", registeredDate: "2026-01-10", lastOnline: "2026-01-22 15:10", status: "online" },
      { uuid: "LCD-E5F6-2B34-88DA", model: "SmartCaster Ultra 55", resolution: "3840x2160", registeredDate: "2026-01-10", lastOnline: "2026-01-22 15:08", status: "online" },
      { uuid: "LCD-E5F6-2B34-88DB", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2026-01-11", lastOnline: "2026-01-22 15:05", status: "online" },
      { uuid: "LCD-E5F6-2B34-88DC", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2026-01-11", lastOnline: "2026-01-22 15:12", status: "online" },
      { uuid: "LCD-E5F6-2B34-88DD", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2026-01-12", lastOnline: "2026-01-22 15:03", status: "online" },
      { uuid: "LCD-E5F6-2B34-88DE", model: "SmartCaster Slim 32", resolution: "1366x768", registeredDate: "2026-01-12", lastOnline: "2026-01-20 12:30", status: "offline" },
      { uuid: "LCD-E5F6-2B34-88DF", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2026-01-13", lastOnline: "2026-01-22 15:15", status: "online" },
      { uuid: "LCD-E5F6-2B34-88E0", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2026-01-13", lastOnline: "2026-01-22 15:11", status: "online" },
      { uuid: "LCD-E5F6-2B34-88E1", model: "SmartCaster Ultra 55", resolution: "3840x2160", registeredDate: "2026-01-14", lastOnline: "2026-01-22 15:09", status: "online" },
      { uuid: "LCD-E5F6-2B34-88E2", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2026-01-14", lastOnline: "2026-01-22 15:14", status: "online" },
      { uuid: "LCD-E5F6-2B34-88E3", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2026-01-15", lastOnline: "2026-01-22 15:07", status: "online" },
      { uuid: "LCD-E5F6-2B34-88E4", model: "SmartCaster Slim 32", resolution: "1366x768", registeredDate: "2026-01-15", lastOnline: "2026-01-21 09:15", status: "offline" },
    ],
    lastLoginDate: "2026-01-21",
    status: "active",
  },
  {
    id: 103,
    name: "송부장",
    email: "bj.song@example.com",
    company: "CU 편의점 본사",
    phone: "010-5555-6666",
    approvedDate: "2026-01-05",
    devices: Array.from({ length: 38 }, (_, i) => ({
      uuid: `LCD-F6G7-3C45-99${String(i).padStart(2, "0")}`,
      model: i % 3 === 0 ? "SmartCaster Ultra 55" : i % 3 === 1 ? "SmartCaster Pro 43" : "SmartCaster Slim 32",
      resolution: i % 3 === 0 ? "3840x2160" : i % 3 === 1 ? "1920x1080" : "1366x768",
      registeredDate: `2026-01-${String(5 + Math.floor(i / 5)).padStart(2, "0")}`,
      lastOnline: i % 5 === 0 ? "2026-01-21 10:30" : "2026-01-22 16:20",
      status: i % 5 === 0 ? "offline" : "online",
    })),
    lastLoginDate: "2026-01-20",
    status: "active",
  },
  {
    id: 104,
    name: "한실장",
    email: "sj.han@example.com",
    company: "GS25 편의점 본사",
    phone: "010-7777-8888",
    approvedDate: "2025-12-28",
    devices: Array.from({ length: 25 }, (_, i) => ({
      uuid: `LCD-G7H8-4D56-AA${String(i).padStart(2, "0")}`,
      model: i % 2 === 0 ? "SmartCaster Pro 43" : "SmartCaster Slim 32",
      resolution: i % 2 === 0 ? "1920x1080" : "1366x768",
      registeredDate: `2025-12-${String(28 + Math.floor(i / 10)).padStart(2, "0")}`,
      lastOnline: i % 4 === 0 ? "2026-01-20 08:15" : "2026-01-22 11:45",
      status: i % 4 === 0 ? "offline" : "online",
    })),
    lastLoginDate: "2026-01-15",
    status: "active",
  },
  {
    id: 105,
    name: "윤대표",
    email: "ceo.yoon@example.com",
    company: "올리브영 강남점",
    phone: "010-9999-0000",
    approvedDate: "2025-12-20",
    devices: [
      { uuid: "LCD-H8I9-5E67-BB01", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2025-12-20", lastOnline: "2026-01-10 14:20", status: "offline" },
      { uuid: "LCD-H8I9-5E67-BB02", model: "SmartCaster Slim 32", resolution: "1366x768", registeredDate: "2025-12-21", lastOnline: "2026-01-08 16:30", status: "offline" },
      { uuid: "LCD-H8I9-5E67-BB03", model: "SmartCaster Pro 43", resolution: "1920x1080", registeredDate: "2025-12-22", lastOnline: "2026-01-09 11:45", status: "offline" },
    ],
    lastLoginDate: "2026-01-10",
    status: "inactive",
  },
];

const initialRejected: RejectedMember[] = [
  {
    id: 201,
    name: "홍길동",
    email: "hong@example.com",
    company: "테스트 매장",
    phone: "010-0000-1111",
    requestDate: "2026-01-20",
    rejectedDate: "2026-01-21",
    rejectedReason: "사업자 정보 불일치",
    device: {
      uuid: "LCD-Z9Y8-X7W6-V5U4",
      model: "SmartCaster Pro 43",
      resolution: "1920x1080",
    },
  },
];

export default function MembersPage() {
  const [requests, setRequests] = useState<MemberRequest[]>(initialRequests);
  const [members, setMembers] = useState<ApprovedMember[]>(initialMembers);
  const [rejected, setRejected] = useState<RejectedMember[]>(initialRejected);
  const [activeTab, setActiveTab] = useState<"requests" | "members" | "rejected">("requests");
  const [expandedMember, setExpandedMember] = useState<number | null>(null);

  const handleApprove = (requestId: number) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    // 요청 목록에서 제거
    setRequests(requests.filter((r) => r.id !== requestId));

    // 승인 목록에 추가
    const newMember: ApprovedMember = {
      id: Date.now(),
      name: request.name,
      email: request.email,
      company: request.company,
      phone: request.phone,
      approvedDate: new Date().toISOString().split("T")[0],
      devices: [
        {
          uuid: request.device.uuid,
          model: request.device.model,
          resolution: request.device.resolution,
          registeredDate: new Date().toISOString().split("T")[0],
          lastOnline: "-",
          status: "offline",
        },
      ],
      lastLoginDate: "-",
      status: "active",
    };
    setMembers([newMember, ...members]);
  };

  const handleReject = (requestId: number, reason?: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    // 요청 목록에서 제거
    setRequests(requests.filter((r) => r.id !== requestId));

    // 거부 목록에 추가
    const rejectedMember: RejectedMember = {
      id: Date.now(),
      name: request.name,
      email: request.email,
      company: request.company,
      phone: request.phone,
      requestDate: request.requestDate,
      rejectedDate: new Date().toISOString().split("T")[0],
      rejectedReason: reason || "관리자에 의해 거부됨",
      device: request.device,
    };
    setRejected([rejectedMember, ...rejected]);
  };

  const handleReApprove = (rejectedId: number) => {
    const rejectedMember = rejected.find((r) => r.id === rejectedId);
    if (!rejectedMember) return;

    // 거부 목록에서 제거
    setRejected(rejected.filter((r) => r.id !== rejectedId));

    // 승인 목록에 추가
    const newMember: ApprovedMember = {
      id: Date.now(),
      name: rejectedMember.name,
      email: rejectedMember.email,
      company: rejectedMember.company,
      phone: rejectedMember.phone,
      approvedDate: new Date().toISOString().split("T")[0],
      devices: [
        {
          uuid: rejectedMember.device.uuid,
          model: rejectedMember.device.model,
          resolution: rejectedMember.device.resolution,
          registeredDate: new Date().toISOString().split("T")[0],
          lastOnline: "-",
          status: "offline",
        },
      ],
      lastLoginDate: "-",
      status: "active",
    };
    setMembers([newMember, ...members]);
  };

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">회원 관리</h1>
        <p className="text-gray-600 mt-1">가입 요청 승인 및 회원 관리</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "requests"
              ? "bg-cyan-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          가입 요청 {requests.length > 0 && `(${requests.length})`}
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "members"
              ? "bg-cyan-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          승인된 회원 ({members.length})
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "rejected"
              ? "bg-cyan-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          거부된 회원 {rejected.length > 0 && `(${rejected.length})`}
        </button>
      </div>

      {/* 가입 요청 탭 */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500">대기 중인 가입 요청이 없습니다</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{request.name}</h3>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded">
                        대기중
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">회사/매장</div>
                        <div className="font-semibold text-gray-800">{request.company}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">이메일</div>
                        <div className="font-semibold text-gray-800">{request.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">연락처</div>
                        <div className="font-semibold text-gray-800">{request.phone}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">요청일</div>
                        <div className="font-semibold text-gray-800">{request.requestDate}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-sm text-gray-600 mb-2">등록 기기 정보</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">UUID:</span>
                          <span className="font-mono text-sm font-semibold text-gray-800">
                            {request.device.uuid}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">모델:</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {request.device.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">해상도:</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {request.device.resolution}
                          </span>
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

      {/* 승인된 회원 탭 */}
      {activeTab === "members" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">이름</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">회사/매장</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">이메일</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">연락처</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  보유 기기
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  최근 접속
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">상태</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map((member) => (
                <>
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{member.name}</div>
                      <div className="text-xs text-gray-500">가입: {member.approvedDate}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-800">{member.company}</td>
                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                    <td className="px-6 py-4 text-gray-600">{member.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                        className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded font-semibold hover:bg-cyan-200 transition-colors"
                      >
                        {member.devices.length}대 {expandedMember === member.id ? "▲" : "▼"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{member.lastLoginDate}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          member.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {member.status === "active" ? "활성" : "비활성"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm">
                        상세보기
                      </button>
                    </td>
                  </tr>
                  {expandedMember === member.id && (
                    <tr key={`${member.id}-devices`}>
                      <td colSpan={8} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-700 mb-3">보유 기기 목록</div>
                          <div className="grid grid-cols-1 gap-2">
                            {member.devices.map((device) => (
                              <div
                                key={device.uuid}
                                className="bg-white rounded border border-gray-200 p-3 flex items-center justify-between"
                              >
                                <div className="flex-1 grid grid-cols-4 gap-4">
                                  <div>
                                    <div className="text-xs text-gray-500">UUID</div>
                                    <div className="font-mono text-sm font-semibold text-gray-800">
                                      {device.uuid}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">모델</div>
                                    <div className="text-sm font-semibold text-gray-800">
                                      {device.model}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">해상도</div>
                                    <div className="text-sm font-semibold text-gray-800">
                                      {device.resolution}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">최근 접속</div>
                                    <div className="text-sm text-gray-600">{device.lastOnline}</div>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <span
                                    className={`px-3 py-1 rounded text-xs font-semibold ${
                                      device.status === "online"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {device.status === "online" ? "●온라인" : "●오프라인"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 거부된 회원 탭 */}
      {activeTab === "rejected" && (
        <div className="space-y-4">
          {rejected.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-gray-500">거부된 회원이 없습니다</p>
            </div>
          ) : (
            rejected.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded">
                        거부됨
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">회사/매장</div>
                        <div className="font-semibold text-gray-800">{member.company}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">이메일</div>
                        <div className="font-semibold text-gray-800">{member.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">연락처</div>
                        <div className="font-semibold text-gray-800">{member.phone}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">거부일</div>
                        <div className="font-semibold text-gray-800">{member.rejectedDate}</div>
                      </div>
                    </div>

                    {member.rejectedReason && (
                      <div className="bg-red-50 rounded p-3 mb-4">
                        <div className="text-sm text-gray-600 mb-1">거부 사유</div>
                        <div className="text-sm font-semibold text-red-700">{member.rejectedReason}</div>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-sm text-gray-600 mb-2">등록 기기 정보</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">UUID:</span>
                          <span className="font-mono text-sm font-semibold text-gray-800">
                            {member.device.uuid}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">모델:</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {member.device.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">해상도:</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {member.device.resolution}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-6">
                    <button
                      onClick={() => handleReApprove(member.id)}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                    >
                      ✓ 승인
                    </button>
                    <button
                      onClick={() => setRejected(rejected.filter((r) => r.id !== member.id))}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 통계 */}
      <div className="mt-6 grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">대기 중인 요청</div>
          <div className="text-2xl font-bold text-yellow-600">{requests.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">승인된 회원</div>
          <div className="text-2xl font-bold text-green-600">{members.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">거부된 회원</div>
          <div className="text-2xl font-bold text-red-600">{rejected.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">활성 회원</div>
          <div className="text-2xl font-bold text-cyan-600">
            {members.filter((m) => m.status === "active").length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">전체 기기</div>
          <div className="text-2xl font-bold text-purple-600">
            {members.reduce((sum, m) => sum + m.devices.length, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
