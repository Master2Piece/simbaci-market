import CategoryForm from '@/components/shared/admin/category-form'
import { APP_NAME } from '@/lib/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: `Buat kategori - ${APP_NAME}`,
}

export default async function CreateCategoryPage() {
  return (
    <>
      <h1 className="h2-bold">Buat kategori baru</h1>

      <div className="my-8">
        <CategoryForm type="Create" />
      </div>
    </>
  )
}
