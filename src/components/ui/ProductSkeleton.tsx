export function ProductCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`product-skeleton-${index}`}
          className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-4">
            <div className="h-[220px] rounded-[20px] bg-slate-100" />
          </div>

          <div className="space-y-3 px-5 pb-5">
            <div className="flex items-center justify-between">
              <div className="h-5 w-20 rounded-full bg-slate-100" />
              <div className="h-5 w-16 rounded-full bg-slate-100" />
            </div>

            <div className="h-5 w-3/4 rounded-md bg-slate-100" />
            <div className="h-4 w-full rounded-md bg-slate-100" />
            <div className="h-4 w-5/6 rounded-md bg-slate-100" />

            <div className="flex items-end justify-between pt-3">
              <div className="space-y-2">
                <div className="h-3 w-12 rounded-md bg-slate-100" />
                <div className="h-6 w-24 rounded-md bg-slate-100" />
              </div>
              <div className="h-11 w-11 rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
