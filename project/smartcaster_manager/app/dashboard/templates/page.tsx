"use client";

const dummyTemplates = [
  {
    id: 1,
    name: "가로형 4존 레이아웃",
    resolution: "1920x1080",
    zones: 4,
    preview: "A(Video) | B(Image)\n-----------------\nC(Image) | D(Text)",
  },
  {
    id: 2,
    name: "가로형 2존 레이아웃",
    resolution: "1920x1080",
    zones: 2,
    preview: "A(Video) | B(Image)",
  },
  {
    id: 3,
    name: "세로형 3존 레이아웃",
    resolution: "1080x1920",
    zones: 3,
    preview: "A(Image)\n--------\nB(Video)\n--------\nC(Text)",
  },
];

export default function TemplatesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">템플릿</h1>
        <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
          + 템플릿 생성
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {dummyTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* 템플릿 미리보기 */}
            <div className="h-48 bg-gray-100 p-4 flex items-center justify-center">
              <pre className="text-xs text-gray-600 whitespace-pre">
                {template.preview}
              </pre>
            </div>

            {/* 템플릿 정보 */}
            <div className="p-4">
              <h3 className="font-bold text-gray-800 mb-2">{template.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>해상도</span>
                  <span className="font-semibold">{template.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span>영역</span>
                  <span className="font-semibold">{template.zones}개 존</span>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600">
                이 템플릿으로 생성
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
