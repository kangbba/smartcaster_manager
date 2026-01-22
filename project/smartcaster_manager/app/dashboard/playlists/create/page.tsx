"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Dummy 미디어 라이브러리
const mediaLibrary = [
  { id: 1, name: "샴푸_광고_01.mp4", type: "video" },
  { id: 2, name: "신선식품_배너.jpg", type: "image" },
  { id: 3, name: "매장_안내.jpg", type: "image" },
  { id: 4, name: "프로모션_텍스트", type: "text" },
];

type Zone = {
  id: string;
  type: "video" | "image" | "text";
  assignedMedia: typeof mediaLibrary[0] | null;
};

export default function CreatePlaylistPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: 템플릿 선택, 2: 미디어 배치, 3: 설정
  const [playlistName, setPlaylistName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [zones, setZones] = useState<Zone[]>([
    { id: "A", type: "video", assignedMedia: null },
    { id: "B", type: "image", assignedMedia: null },
    { id: "C", type: "image", assignedMedia: null },
    { id: "D", type: "text", assignedMedia: null },
  ]);

  const templates = [
    { id: "4zone", name: "가로형 4존", zones: 4, layout: "grid" },
    { id: "2zone", name: "가로형 2존", zones: 2, layout: "horizontal" },
    { id: "3zone-vertical", name: "세로형 3존", zones: 3, layout: "vertical" },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep(2);
  };

  const assignMediaToZone = (zoneId: string, media: typeof mediaLibrary[0]) => {
    setZones(zones.map(zone =>
      zone.id === zoneId ? { ...zone, assignedMedia: media } : zone
    ));
  };

  const removeMediaFromZone = (zoneId: string) => {
    setZones(zones.map(zone =>
      zone.id === zoneId ? { ...zone, assignedMedia: null } : zone
    ));
  };

  const handleSave = () => {
    // TODO: 실제 저장 로직
    alert(`플레이리스트 "${playlistName}" 생성 완료!`);
    router.push("/dashboard/playlists");
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          플레이리스트 생성
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-cyan-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-cyan-500 text-white" : "bg-gray-300 text-gray-600"}`}>
              1
            </div>
            <span>템플릿 선택</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-cyan-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-cyan-500 text-white" : "bg-gray-300 text-gray-600"}`}>
              2
            </div>
            <span>미디어 배치</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? "text-cyan-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-cyan-500 text-white" : "bg-gray-300 text-gray-600"}`}>
              3
            </div>
            <span>설정 및 저장</span>
          </div>
        </div>
      </div>

      {/* Step 1: 템플릿 선택 */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">템플릿 선택</h2>
          <div className="grid grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
              >
                <div className="h-32 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400">
                  {template.zones}존 레이아웃 미리보기
                </div>
                <h3 className="font-bold text-gray-800">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.zones}개 영역</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: 미디어 배치 */}
      {step === 2 && (
        <div className="grid grid-cols-3 gap-6">
          {/* 왼쪽: 템플릿 캔버스 */}
          <div className="col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">미디어 배치</h2>
            <div className="bg-gray-900 rounded-lg p-4" style={{ aspectRatio: "16/9" }}>
              <div className="grid grid-cols-2 gap-2 h-full">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`rounded border-2 border-dashed p-4 flex flex-col items-center justify-center ${
                      zone.assignedMedia
                        ? "bg-cyan-500 border-cyan-300"
                        : "bg-gray-700 border-gray-500"
                    }`}
                  >
                    <div className="text-white font-bold mb-2">Zone {zone.id}</div>
                    <div className="text-xs text-gray-300 mb-2">({zone.type})</div>
                    {zone.assignedMedia ? (
                      <div className="text-center">
                        <div className="text-white text-sm mb-2">{zone.assignedMedia.name}</div>
                        <button
                          onClick={() => removeMediaFromZone(zone.id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          제거
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">
                        오른쪽에서 선택 →
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                ← 이전
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
              >
                다음 →
              </button>
            </div>
          </div>

          {/* 오른쪽: 미디어 라이브러리 */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">미디어 라이브러리</h3>
            <div className="space-y-2">
              {mediaLibrary.map((media) => (
                <div
                  key={media.id}
                  className="bg-white rounded shadow p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {media.name}
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {media.type}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    할당 가능한 존:
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {zones
                      .filter((zone) => zone.type === media.type)
                      .map((zone) => (
                        <button
                          key={zone.id}
                          onClick={() => assignMediaToZone(zone.id, media)}
                          className="px-2 py-1 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600"
                          disabled={zone.assignedMedia !== null}
                        >
                          Zone {zone.id}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 설정 및 저장 */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">설정 및 저장</h2>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                플레이리스트 이름
              </label>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="예: ABB 샴푸 캠페인"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                재생 시간 설정
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600">시작 시간</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border rounded-lg"
                    defaultValue="08:00"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">종료 시간</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border rounded-lg"
                    defaultValue="23:59"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                배치된 미디어 확인
              </label>
              <div className="space-y-2">
                {zones.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Zone {zone.id} ({zone.type})</span>
                    <span className="text-sm text-gray-600">
                      {zone.assignedMedia ? zone.assignedMedia.name : "미할당"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                ← 이전
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                disabled={!playlistName}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
