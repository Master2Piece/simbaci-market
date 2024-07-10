import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import CategoryForm from '@/components/shared/admin/category-form'
import { APP_NAME } from '@/lib/constants'
import { getCategoryById } from '@/lib/actions/categories-action'

export const metadata: Metadata = {
  title: `Update kategori - ${APP_NAME}`,
}

export default async function UpdateCategoryPage({
  params: { id },
}: {
  params: {
    id: string
  }
}) {
  const category = await getCategoryById(id)
  if (!category) notFound()
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Kategori</h1>
      <CategoryForm
        type="Update"
        category={category}
        categoryId={category.id}
      />
    </div>
  )
}
