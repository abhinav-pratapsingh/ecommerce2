import ProductCard from './ProductCard'
import { ProductSkeleton } from './Loader'

const ProductGrid = ({ products, loading, cols = 4 }) => {
  const colMap = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  }

  if (loading) {
    return (
      <div className={`grid ${colMap[cols] || colMap[4]} gap-4`}>
        {Array.from({ length: cols * 2 }).map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    )
  }

  if (!products?.length) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-2xl font-mono text-ink-faint">BOX</div>
        <p className="text-ink-muted font-body text-lg">No products found</p>
        <p className="text-ink-faint text-sm">Try adjusting your filters or search query</p>
      </div>
    )
  }

  return (
    <div className={`grid ${colMap[cols] || colMap[4]} gap-4`}>
      {products.map(p => <ProductCard key={p._id} product={p} />)}
    </div>
  )
}

export default ProductGrid

