"use client";

import { useMemo, useState } from "react";
import { MediaFile } from "@/lib/types";
import { getFileIcon } from "@/lib/utils/fileIcons";

type ViewMode = "grid" | "list";

interface MediaLibraryPanelProps {
  media: MediaFile[];
  selectedMediaName?: string | null;
  onSelect: (name: string) => void;
  onImport?: () => void;
  onDelete?: (id: string) => void;
  footer?: React.ReactNode;
}

export default function MediaLibraryPanel({
  media,
  selectedMediaName,
  onSelect,
  onImport,
  onDelete,
  footer,
}: MediaLibraryPanelProps) {
  const [query, setQuery] = useState<string>("");
  const [zoom, setZoom] = useState<number>(3);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return media;
    return media.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [media, query]);

  const effectiveView: ViewMode = zoom <= 1 ? "list" : viewMode;

  const gridCols =
    zoom >= 4 ? "grid-cols-2" : zoom === 3 ? "grid-cols-3" : "grid-cols-4";
  const iconSize =
    zoom >= 4 ? "text-6xl" : zoom === 3 ? "text-5xl" : "text-4xl";
  const cardPadding = zoom >= 4 ? "p-4" : zoom === 3 ? "p-3" : "p-2";

  return (
    <div className="w-80 border-r flex flex-col bg-gray-50">
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700">미디어 라이브러리</h3>
          <button
            onClick={onImport}
            className="px-3 py-1 bg-cyan-500 text-white text-xs rounded hover:bg-cyan-600 font-medium"
          >
            + 가져오기
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="미디어 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-1.5 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2 py-1 text-xs rounded ${
                effectiveView === "grid"
                  ? "bg-gray-200 text-gray-800"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              disabled={zoom <= 1}
            >
              아이콘
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2 py-1 text-xs rounded ${
                effectiveView === "list"
                  ? "bg-gray-200 text-gray-800"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              목록
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((prev) => Math.max(1, prev - 1))}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
            >
              −
            </button>
            <button
              onClick={() => setZoom((prev) => Math.min(4, prev + 1))}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {effectiveView === "list" ? (
          <div className="flex flex-col divide-y">
            {filtered.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => onSelect(item.name)}
                onClick={() => onSelect(item.name)}
                className={`group flex items-center gap-3 px-2 py-2 cursor-move transition-all ${
                  selectedMediaName === item.name
                    ? "bg-blue-100 ring-1 ring-blue-500"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded bg-gray-100">
                  {item.type === "image" && item.url ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{getFileIcon(item.type)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500">{item.size}</div>
                </div>
                {onDelete && (
                  <button
                    className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid ${gridCols} gap-3`}>
            {filtered.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => onSelect(item.name)}
                onClick={() => onSelect(item.name)}
                className={`group flex flex-col items-center ${cardPadding} rounded-lg cursor-move transition-all ${
                  selectedMediaName === item.name
                    ? "bg-blue-100 ring-2 ring-blue-500"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <div className={`mb-2 ${iconSize} flex items-center justify-center w-16 h-16 rounded bg-gray-100 overflow-hidden`}>
                  {item.type === "image" && item.url ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getFileIcon(item.type)}</span>
                  )}
                </div>
                <div className="text-xs font-medium text-gray-800 text-center truncate w-full px-1">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{item.size}</div>
                {onDelete && (
                  <button
                    className="mt-1 text-[10px] text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {footer}
    </div>
  );
}
