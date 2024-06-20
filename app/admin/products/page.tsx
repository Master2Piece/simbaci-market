import Link from 'next/link'

import DeleteDialog from '@/components/shared/delete-dialog'
import Pagination from '@/components/shared/pagination'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteProduct, getAllProducts } from '@/lib/actions/product-actions'
import { formatId } from '@/lib/utils'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: {
    page: string
    query: string
    category: string
  }
}) {
  const page = Number(searchParams.page) || 1
  const searchText = searchParams.query || ''
  const category = searchParams.category || ''
  const products = await getAllProducts({
    query: searchText,
    category,
    page,
  })
  return (
    <div className="space-y-2">
      <div className="flex-between">
        <h1 className="h2-bold">Produk</h1>
        <Button asChild variant="default">
          <Link href="/admin/products/create">Buat produk</Link>
        </Button>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Nama produk</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="w-[100px]">Tindakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.data.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{formatId(product.id)}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-right">Rp.{product.price}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/products/${product.id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={product.id} action={deleteProduct} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {products?.totalPages! > 1 && (
          <Pagination page={page} totalPages={products?.totalPages!} />
        )}
      </div>
    </div>
  )
}
