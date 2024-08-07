import { auth } from '@/auth'
import CancelDialog from '@/components/shared/cancel-dialog'
import Pagination from '@/components/shared/pagination'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { cancelOrder, getAllOrders } from '@/lib/actions/order-actions'
import { APP_NAME } from '@/lib/constants'
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: `Admin Orders - ${APP_NAME}`,
}
export default async function OrdersPage({
  searchParams: { page = '1' },
}: {
  searchParams: { page: string }
}) {
  const session = await auth()
  if (session?.user.role !== 'admin')
    throw new Error('admin permission required')

  const orders = await getAllOrders({
    page: Number(page),
  })
  return (
    <div className="space-y-2">
      <h1 className="h2-bold">Pesanan</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pembeli</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Terbayar</TableHead>
              <TableHead>Terkirim</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tindakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell>
                  {order.createdAt
                    ? formatDateTime(order.createdAt).dateTime
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {order.user ? order.user.name : 'Deleted user'}
                </TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {order.isPaid ? (
                    <span className="text-green-500">Sudah Dibayar</span>
                  ) : (
                    'Belum Bayar'
                  )}
                </TableCell>
                <TableCell>
                  {order.isDelivered ? (
                    <span className="text-green-500">Sudah Dikirim</span>
                  ) : (
                    'Belum Dikirim'
                  )}
                </TableCell>
                <TableCell>
                  {order.status ? <span>{order.status}</span> : 'N/A'}
                </TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/order/${order.id}`}>Detail</Link>
                  </Button>
                  <CancelDialog id={order.id} action={cancelOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination page={page} totalPages={orders?.totalPages!} />
        )}
      </div>
    </div>
  )
}
