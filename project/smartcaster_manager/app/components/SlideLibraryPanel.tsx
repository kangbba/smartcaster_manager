"use client";

import type { Slide, MediaFile } from "@/lib/types";
import SlideThumbnail from "./SlideThumbnail";

type SlideLibraryProject = {
  id: string;
  name: string;
  client?: string;
};

export type SlideWithMedia = {
  slide: Slide;
  media: MediaFile | null;
};

interface SlideLibraryPanelProps {
  projects: SlideLibraryProject[];
  slidesWithMedia: SlideWithMedia[];
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onDragStart: (slideId: string) => void;
  onDragEnd: () => void;
  isUsed: (slideId: string) => boolean;
}

export default function SlideLibraryPanel({
  projects,
  slidesWithMedia,
  selectedProjectId,
  onSelectProject,
  onDragStart,
  onDragEnd,
  isUsed,
}: SlideLibraryPanelProps) {
  return (
    <div className="w-80 bg-white border-r flex flex-col">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-800">슬라이드 라이브러리</h3>
        <p className="text-xs text-gray-500 mt-0.5">드래그하여 추가</p>
      </div>

      <div className="px-4 py-2 border-b bg-white flex flex-wrap gap-2">
        <button
          onClick={() => onSelectProject(null)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            selectedProjectId === null
              ? "bg-cyan-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          전체
        </button>
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedProjectId === project.id
                ? "bg-cyan-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {project.client || project.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {slidesWithMedia.map(({ slide, media }) => {
          const used = isUsed(slide.id);

          return (
            <div
              key={slide.id}
              draggable
              onDragStart={() => onDragStart(slide.id)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-3 p-3 border-b cursor-move transition-all hover:bg-gray-50 ${
                used ? "opacity-40" : ""
              }`}
            >
              <div
                className="w-24 h-14 flex-shrink-0 rounded overflow-hidden relative"
                style={{ backgroundColor: slide.backgroundColor }}
              >
                <SlideThumbnail slide={slide} media={media} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-800 truncate">{slide.name}</h4>
                <p className="text-xs text-cyan-600 truncate">{slide.projectName}</p>
                <p className="text-xs text-gray-500">{slide.duration}초</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
