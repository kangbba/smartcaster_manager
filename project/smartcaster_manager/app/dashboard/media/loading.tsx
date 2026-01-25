import { Skeleton } from "@/app/components/ui/Skeleton";

export default function MediaLoading() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-4 gap-4 xl:grid-cols-5">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
