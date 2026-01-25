import { SkeletonSlideGrid } from "@/app/components/ui/Skeleton";

export default function ProjectDetailLoading() {
  return (
    <div className="p-8">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="mb-4">
          <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Info box skeleton */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-blue-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-blue-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Slides grid skeleton */}
      <div className="flex gap-4 h-[calc(100vh-300px)]">
        <div className="w-full bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <SkeletonSlideGrid count={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
