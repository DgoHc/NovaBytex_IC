export function ProductCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`product-skeleton-${index}`}
          className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-4">
            <div className="h-[220px] animate-pulse rounded-[20px] bg-slate-200" />
          </div>

          <div className="space-y-3 px-5 pb-5">
            <div className="flex items-center justify-between">
              <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
            </div>

            <div className="h-5 w-3/4 animate-pulse rounded-md bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-md bg-slate-200" />
            <div className="h-4 w-5/6 animate-pulse rounded-md bg-slate-200" />

            <div className="flex items-end justify-between pt-3">
              <div className="space-y-2">
                <div className="h-3 w-12 animate-pulse rounded-md bg-slate-200" />
                <div className="h-6 w-24 animate-pulse rounded-md bg-slate-200" />
              </div>
              <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
