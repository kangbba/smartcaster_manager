import { Skeleton } from "@/app/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Charts or content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
