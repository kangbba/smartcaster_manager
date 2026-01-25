"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase/client";
import { devicesData } from "@/lib/data/devices";
import { membersData } from "@/lib/data/members";
import { getAssignments, setAssignments, subscribeAssignments } from "@/lib/data/assignmentsStore";
import PlaylistPreviewGrid, { type PreviewSlideData } from "@/app/components/PlaylistPreviewGrid";
import type { Slide } from "@/lib/types";

export default function AssignmentsPage() {
  const [playlistSummaries, setPlaylistSummaries] = useState<Array<{ id: string; name: string; slideCount: number; totalDuration: string; previewSlides: PreviewSlideData[] }>>([]);
  const playlistById = useMemo(
    () => new Map(playlistSummaries.map((p) => [p.id, p])),
    [playlistSummaries]
  );
  const memberById = useMemo(
    () => new Map(membersData.map((member) => [member.id, member])),
    []
  );

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devicesData[0]?.id ?? "");
  const deviceAssignments = useSyncExternalStore(subscribeAssignments, getAssignments, getAssignments);
  const [draftAssignments, setDraftAssignments] = useState<Record<string, string | null>>(getAssignments());

  const selectedDevice = devicesData.find((device) => device.id === selectedDeviceId);
  const selectedPlaylistId = selectedDevice ? deviceAssignments[selectedDevice.id] : null;
  const draftPlaylistId = selectedDevice ? draftAssignments[selectedDevice.id] : null;
  const selectedDraftPlaylist = draftPlaylistId ? playlistById.get(draftPlaylistId) : null;
  const hasPendingChange = selectedDevice
    ? deviceAssignments[selectedDevice.id] !== draftAssignments[selectedDevice.id]
    : false;
  const selectedPlaylist = selectedPlaylistId ? playlistById.get(selectedPlaylistId) : null;

  const assignedCount = Object.values(deviceAssignments).filter((id) => id !== null).length;
  const unassignedCount = devicesData.length - assignedCount;

  useEffect(() => {
    setDraftAssignments(deviceAssignments);
  }, [deviceAssignments]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("playlists")
        .select("id,name,created_at");
      const { data: itemData } = await supabase
        .from("playlist_items")
        .select("playlist_id,slide_id");
      const { data: slideData } = await supabase
        .from("slides")
        .select("id,duration_seconds");

      type SlideRow = { id: string; duration_seconds: number | null; background_color?: string | null };
      type ItemRow = { playlist_id: string; slide_id: string };
      type PlaylistRow = { id: string; name: string };

      const slideById = new Map(
        (slideData as SlideRow[] | null | undefined || []).map((s) => [s.id, s.duration_seconds || 0])
      );
      const slideBgById = new Map(
        (slideData as SlideRow[] | null | undefined || []).map((s) => [s.id, s.background_color || "#000000"])
      );
      const itemsByPlaylist = new Map<string, string[]>();
      ((itemData as ItemRow[] | null | undefined) || []).forEach((item) => {
        if (!itemsByPlaylist.has(item.playlist_id)) {
          itemsByPlaylist.set(item.playlist_id, []);
        }
        itemsByPlaylist.get(item.playlist_id)?.push(item.slide_id);
      });

      const summaries: Array<{ id: string; name: string; slideCount: number; totalDuration: string; previewSlides: PreviewSlideData[] }> =
        ((data as PlaylistRow[] | null | undefined) || []).map((playlist) => {
        const slideIds = itemsByPlaylist.get(playlist.id) || [];
        const durations = slideIds.map((id) => slideById.get(id) || 0);
        const totalSeconds = durations.reduce((sum, v) => sum + v, 0);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return {
          id: playlist.id,
          name: playlist.name,
          slideCount: slideIds.length,
          totalDuration: `${mins}분 ${secs}초`,
          previewSlides: slideIds.slice(0, 4).map((id) => {
            const backgroundColor = slideBgById.get(id) || "#000000";
            const slide: Slide = {
              id,
              projectId: "",
              projectName: "",
              name: "슬라이드",
              duration: slideById.get(id) || 10,
              backgroundColor,
              resolutionWidth: 1920,
              resolutionHeight: 1080,
            };
            return {
              slide,
              media: null,
            };
          }),
        };
      });
      setPlaylistSummaries(summaries);
    };
    void load();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">송출 관리</h1>
        <p className="text-gray-600">단말기마다 1개의 플레이리스트를 매칭합니다.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">전체 단말기</div>
          <div className="text-2xl font-bold text-gray-800">{devicesData.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">매칭됨</div>
          <div className="text-2xl font-bold text-cyan-600">{assignedCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">미매칭</div>
          <div className="text-2xl font-bold text-gray-500">{unassignedCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-[1.1fr_1.2fr_1.1fr] gap-6">
        {/* 단말기 */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">단말기</h2>
            <span className="text-xs text-gray-500">클릭해서 선택</span>
          </div>
          <div className="space-y-3 overflow-y-auto">
            {devicesData.map((device) => {
              const assigned = deviceAssignments[device.id];
              return (
                <button
                  key={device.id}
                  onClick={() => setSelectedDeviceId(device.id)}
                  className={`w-full text-left border rounded-lg p-3 transition-all ${
                    selectedDeviceId === device.id
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-gray-800">{device.name}</div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${
                        device.status === "online" ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        device.status === "online" ? "bg-green-500" : "bg-gray-300"
                      }`} />
                      {device.status === "online" ? "온라인" : "오프라인"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {device.group} • {memberById.get(device.memberId)?.company ?? "미지정"}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {assigned ? `매칭: ${playlistById.get(assigned)?.name ?? "알 수 없음"}` : "미매칭"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 매칭 보드 */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-800">매칭</h2>
            <span className="text-xs text-gray-500">플레이리스트를 바로 적용</span>
          </div>

          {!selectedDevice ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              단말기를 선택하세요
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="text-xs text-gray-500 mb-1">선택된 단말기</div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="font-semibold text-gray-800">{selectedDevice.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedDevice.group}
                    {" • "}
                    {memberById.get(selectedDevice.memberId)?.company ?? "미지정"}
                    {" • "}
                    {selectedDevice.lastSeen}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-2">현재 매칭</div>
                {selectedPlaylist ? (
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                        📺
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate">{selectedPlaylist.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          슬라이드 {selectedPlaylist.slideCount}개 • {selectedPlaylist.totalDuration}
                        </div>
                      </div>
                      <button
                        onClick={() => setDraftAssignments((prev) => ({
                          ...prev,
                          [selectedDevice.id]: null,
                        }))}
                        className="px-3 py-2 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                      >
                        해제
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-400">
                    아직 매칭된 플레이리스트가 없습니다
                  </div>
                )}

                {hasPendingChange && (
                  <div className="mt-4 border rounded-lg p-4 bg-amber-50">
                    <div className="text-xs text-amber-600 mb-2">변경 예정</div>
                    {selectedDraftPlaylist ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                          📺
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">{selectedDraftPlaylist.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            슬라이드 {selectedDraftPlaylist.slideCount}개 • {selectedDraftPlaylist.totalDuration}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700">매칭 해제 예정</div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    if (!selectedDevice) return;
                    setDraftAssignments((prev) => ({
                      ...prev,
                      [selectedDevice.id]: deviceAssignments[selectedDevice.id],
                    }));
                  }}
                  disabled={!hasPendingChange}
                  className={`px-4 py-2 text-sm rounded-lg border ${
                    hasPendingChange
                      ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                      : "border-gray-200 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (!selectedDevice) return;
                    setAssignments((prev) => ({
                      ...prev,
                      [selectedDevice.id]: draftAssignments[selectedDevice.id] ?? null,
                    }));
                  }}
                  disabled={!hasPendingChange}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    hasPendingChange
                      ? "bg-cyan-500 text-white hover:bg-cyan-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  적용
                </button>
              </div>
            </>
          )}
        </div>

        {/* 플레이리스트 */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">플레이리스트</h2>
            <span className="text-xs text-gray-500">클릭하면 적용</span>
          </div>
          <div className="space-y-3 overflow-y-auto">
            {playlistSummaries.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => {
                  if (!selectedDevice) return;
                  setDraftAssignments((prev) => ({
                    ...prev,
                    [selectedDevice.id]: playlist.id,
                  }));
                }}
                className="w-full text-left border rounded-lg p-3 transition-all hover:border-cyan-400 hover:bg-cyan-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-50 p-1">
                    <PlaylistPreviewGrid slides={playlist.previewSlides} columns={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{playlist.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      슬라이드 {playlist.slideCount}개 • {playlist.totalDuration}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">적용</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
