import Pagination from '@/components/shared/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getMyOrders } from '@/lib/actions/order-actions'
import { APP_NAME } from '@/lib/constants'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: `Pesanan saya - ${APP_NAME}`,
}
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { page: string }
}) {
  const page = Number(searchParams.page) || 1
  const orders = await getMyOrders({
    page,
    limit: 6,
  })
  return (
    <div className="space-y-2">
      <h2 className="h2-bold">Pesanan</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Terbayar</TableHead>
              <TableHead>Terkirim</TableHead>
              <TableHead>Tindakan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id.substring(20, 24)}</TableCell>
                <TableCell>
                  {order.createdAt
                    ? formatDateTime(order.createdAt).dateTime
                    : 'N/A'}
                </TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {order.isPaid ? (
                    <span className="text-green-500">Sudah Bayar</span>
                  ) : (
                    'Belum Bayar'
                  )}
                </TableCell>
                <TableCell>
                  {order.isDelivered && order.deliveredAt
                    ? formatDateTime(order.deliveredAt).dateTime
                    : 'belum terkirim'}
                </TableCell>
                <TableCell>
                  <Link href={`/order/${order.id}`}>
                    <span className="px-2">Details</span>
                  </Link>
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
