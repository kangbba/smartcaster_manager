"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type User = {
  id: string;
  email: string;
  fullName: string | null;
  company: string | null;
  phone: string | null;
  createdAt: string;
  lastSignInAt: string | null;
};

export default function MembersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      // TODO: Supabase auth.users를 가져오는 로직 구현
      // 현재는 더미 데이터 사용
      const dummyUsers: User[] = [
        {
          id: "user_001",
          email: "dae.jung@example.com",
          fullName: "정대리",
          company: "현대백화점 압구정점",
          phone: "010-1111-2222",
          createdAt: "2026-01-15",
          lastSignInAt: "2026-01-22",
        },
        {
          id: "user_002",
          email: "gj.choi@example.com",
          fullName: "최과장",
          company: "롯데백화점 본점",
          phone: "010-3333-4444",
          createdAt: "2026-01-10",
          lastSignInAt: "2026-01-21",
        },
        {
          id: "user_003",
          email: "chulsoo.kim@example.com",
          fullName: "김철수",
          company: "스타벅스 강남점",
          phone: "010-1234-5678",
          createdAt: "2026-01-20",
          lastSignInAt: "2026-01-23",
        },
      ];

      setUsers(dummyUsers);
      setLoading(false);
    };

    void loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">회원 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">회원 관리</h1>
        <p className="text-gray-600 mt-1">구글 로그인으로 가입한 회원 목록</p>
      </div>

      {/* 통계 */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow p-4 inline-block">
          <div className="text-sm text-gray-600 mb-1">전체 회원</div>
          <div className="text-2xl font-bold text-gray-800">{users.length}</div>
        </div>
      </div>

      {/* 회원 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">이름</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">이메일</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">회사/매장</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">연락처</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">가입일</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">최근 접속</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  가입된 회원이 없습니다
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{user.fullName || "-"}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-800">{user.company || "-"}</td>
                  <td className="px-6 py-4 text-gray-600">{user.phone || "-"}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{user.createdAt}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {user.lastSignInAt || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
