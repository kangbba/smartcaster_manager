import React from "react";
import { Slide } from "@/lib/types";
import type { ElementType } from "./SlideElementPanels";

type SlidePropertiesBarProps = {
  slide: Slide;
  selectedElement: ElementType;
  onUpdate: (updates: Partial<Slide>) => void;
};

export function SlidePropertiesBar({ slide, selectedElement, onUpdate }: SlidePropertiesBarProps) {
  if (!selectedElement) {
    return (
      <div className="bg-gray-50 border-b border-gray-300 px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>💡</span>
          <span>요소를 선택하여 편집하세요</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border-b border-gray-300 px-6 py-3">
      <div className="flex items-center gap-6">
        {/* Element type indicator */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <span className="font-semibold text-sm text-gray-700">
            {selectedElement === "background" && "🎨 배경"}
            {selectedElement === "image" && "🖼️ 이미지"}
            {selectedElement === "text" && "📝 텍스트"}
            {selectedElement === "audio" && "🔊 오디오"}
          </span>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Properties based on selected element */}
        {selectedElement === "background" && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">배경색:</label>
              <input
                type="color"
                value={slide.backgroundColor || "#000000"}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={slide.backgroundColor || "#000000"}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-24 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">해상도:</label>
              <input
                type="number"
                value={slide.resolutionWidth || 1920}
                onChange={(e) => onUpdate({ resolutionWidth: parseInt(e.target.value) })}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="W"
              />
              <span className="text-gray-400">×</span>
              <input
                type="number"
                value={slide.resolutionHeight || 1080}
                onChange={(e) => onUpdate({ resolutionHeight: parseInt(e.target.value) })}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="H"
              />
            </div>
          </>
        )}

        {selectedElement === "image" && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">크기:</label>
              <input
                type="number"
                step="0.1"
                value={slide.mediaScaleX || 1}
                onChange={(e) => onUpdate({ mediaScaleX: parseFloat(e.target.value) })}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="X"
              />
              <span className="text-gray-400">×</span>
              <input
                type="number"
                step="0.1"
                value={slide.mediaScaleY || 1}
                onChange={(e) => onUpdate({ mediaScaleY: parseFloat(e.target.value) })}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="Y"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">위치:</label>
              <input
                type="number"
                step="10"
                value={slide.mediaOffsetX || 0}
                onChange={(e) => onUpdate({ mediaOffsetX: parseFloat(e.target.value) })}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="X"
              />
              <input
                type="number"
                step="10"
                value={slide.mediaOffsetY || 0}
                onChange={(e) => onUpdate({ mediaOffsetY: parseFloat(e.target.value) })}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="Y"
              />
            </div>
            <button
              onClick={() =>
                onUpdate({
                  mediaScaleX: 1,
                  mediaScaleY: 1,
                  mediaOffsetX: 0,
                  mediaOffsetY: 0,
                })
              }
              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
            >
              초기화
            </button>
          </>
        )}

        {selectedElement === "text" && (
          <>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <label className="text-xs text-gray-600">내용:</label>
              <input
                type="text"
                value={slide.text || ""}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="텍스트를 입력하세요"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">크기:</label>
              <input
                type="number"
                min="12"
                max="120"
                value={slide.fontSize || 32}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">색상:</label>
              <input
                type="color"
                value={slide.textColor || "#ffffff"}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">위치:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={slide.textPositionX ?? 50}
                onChange={(e) => onUpdate({ textPositionX: parseFloat(e.target.value) })}
                className="w-14 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="X"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={slide.textPositionY ?? 50}
                onChange={(e) => onUpdate({ textPositionY: parseFloat(e.target.value) })}
                className="w-14 px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="Y"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
          </>
        )}

        {selectedElement === "audio" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">오디오: {slide.audio || "없음"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
