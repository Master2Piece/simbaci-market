import ProductForm from '@/components/shared/admin/product-form'
import { APP_NAME } from '@/lib/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: `Buat Produk - ${APP_NAME}`,
}

export default async function CreateProductPage() {
  return (
    <>
      <h1 className="h2-bold">Buat produk baru</h1>

      <div className="my-8">
        <ProductForm type="Create" />
      </div>
    </>
  )
}
