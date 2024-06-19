import ProductCarousel from '@/components/shared/product/product-carousel'
import ProductList from '@/components/shared/product/product-list'
import {
  getProducts,
  getFeaturedProducts,
  getLatestProducts,
} from '@/lib/actions/product-actions'
import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: `${APP_NAME} - ${APP_DESCRIPTION}`,
}

export default async function Home() {
  const latestProducts = await getLatestProducts()
  const featuredProducts = await getFeaturedProducts()
  const allProducts = await getProducts()
  return (
    <div>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <div className="space-y-8">
        <ProductList title="Produk terbaru" data={latestProducts} />
      </div>
      <div className="space-y-8">
        <ProductList title="Semua produk" data={allProducts} />
      </div>
    </div>
  )
}
