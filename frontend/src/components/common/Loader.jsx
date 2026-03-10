//  Spinner Loader 
export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-2 border-surface-muted border-t-brand-500 rounded-full animate-spin`} />
    </div>
  )
}

//  Full-page Loader 
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 border-2 border-surface-muted border-t-brand-500 rounded-full animate-spin" />
      <p className="text-ink-muted text-sm font-body">Loading ShopVault</p>
    </div>
  </div>
)

//  Product Card Skeleton 
export const ProductSkeleton = () => (
  <div className="card p-0 overflow-hidden">
    <div className="skeleton aspect-square" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="skeleton h-5 w-1/3 rounded" />
      <div className="skeleton h-10 w-full rounded-lg" />
    </div>
  </div>
)

//  Table Row Skeleton 
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="skeleton h-10 flex-1 rounded" />
        ))}
      </div>
    ))}
  </div>
)

//  Inline Skeleton line 
export const SkeletonLine = ({ className = '' }) => (
  <div className={`skeleton rounded ${className}`} />
)

