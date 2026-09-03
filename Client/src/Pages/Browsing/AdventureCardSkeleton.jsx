import { Skeleton } from "../../components/ui/skeleton"

export function AdventureCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-full flex flex-col">
      {/* Image skeleton */}
      <Skeleton className="w-full h-56 bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-2 bg-gray-200" />

        {/* Location */}
        <Skeleton className="h-4 w-1/2 mb-3 bg-gray-200" />

        {/* Description lines */}
        <Skeleton className="h-3 w-full mb-2 bg-gray-200" />
        <Skeleton className="h-3 w-4/5 mb-4 bg-gray-200" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
          {/* Date badge */}
          <Skeleton className="h-6 w-32 rounded-full bg-gray-200" />

          {/* Button */}
          <Skeleton className="h-11 w-full rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  )
}
