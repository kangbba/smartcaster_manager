/**
 * Skeleton Loading Component
 * 콘텐츠 로딩 중 표시되는 스켈레톤 UI
 */

import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
}

/**
 * 카드 그리드 스켈레톤
 */
export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <div className="p-2 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 테이블 스켈레톤
 */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * 리스트 스켈레톤
 */
export function SkeletonList({ items = 8 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded border">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 프로젝트/슬라이드 그리드 스켈레톤
 */
export function SkeletonSlideGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
          {/* 16:9 aspect ratio */}
          <Skeleton className="aspect-video w-full" />
          {/* Info section */}
          <div className="p-2 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
