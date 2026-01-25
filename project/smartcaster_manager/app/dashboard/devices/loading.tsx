import { SkeletonTable } from "@/app/components/ui/Skeleton";

export default function DevicesLoading() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>

      <SkeletonTable rows={10} />
    </div>
  );
}
