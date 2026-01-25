import { Skeleton, SkeletonSlideGrid } from "@/app/components/ui/Skeleton";

export default function PlaylistDetailLoading() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Layout skeleton */}
      <div className="flex gap-4 h-[calc(100vh-250px)]">
        {/* Left panel - Slide library */}
        <div className="w-80 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Skeleton className="h-12 w-16" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Playlist */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex-1 p-4">
            <SkeletonSlideGrid count={6} />
          </div>
        </div>

        {/* Right - Preview */}
        <div className="w-96 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <Skeleton className="aspect-video w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
