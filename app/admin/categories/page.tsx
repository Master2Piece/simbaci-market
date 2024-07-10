import Link from 'next/link'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  deleteCategory,
  getAllCategories,
} from '@/lib/actions/categories-action'
import { formatId } from '@/lib/utils'

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories()
  return (
    <div className="space-y-2">
      <div className="flex-between">
        <h1 className="h2-bold">Kategori</h1>
        <Button asChild variant="default">
          <Link href="/admin/categories/create">Buat kategori</Link>
        </Button>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Nama kategori</TableHead>
              <TableHead className="w-[100px]">Tindakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.category_name.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{formatId(category.id)}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell className="flex">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/categories/${category.id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={category.id} action={deleteCategory} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
