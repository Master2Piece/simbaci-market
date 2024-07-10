'use client'

import {
  usePayPalScriptReducer,
  PayPalButtons,
  PayPalScriptProvider,
} from '@paypal/react-paypal-js'
import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import {
  approvePayPalOrder,
  createPayPalOrder,
  deliverOrder,
  updateOrderToPaidByCOD,
} from '@/lib/actions/order-actions'
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils'
import { Order } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'

export default function OrderDetailsForm({
  order,
  paypalClientId,
  isAdmin,
}: {
  order: Order
  paypalClientId: string
  isAdmin: boolean
}) {
  const {
    shippingAddress,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order

  const { toast } = useToast()

  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer()
    let status = ''
    if (isPending) {
      status = 'Loading PayPal...'
    } else if (isRejected) {
      status = 'Error in loading PayPal.'
    }
    return status
  }
  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id)
    if (!res.success)
      return toast({
        description: res.message,
        variant: 'destructive',
      })
    return res.data
  }

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data)
    toast({
      description: res.message,
      variant: res.success ? 'default' : 'destructive',
    })
  }

  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await updateOrderToPaidByCOD(order.id)
            toast({
              variant: res.success ? 'default' : 'destructive',
              description: res.message,
            })
          })
        }
      >
        {isPending ? 'processing...' : 'Telah dibayar'}
      </Button>
    )
  }

  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await deliverOrder(order.id)
            toast({
              variant: res.success ? 'default' : 'destructive',
              description: res.message,
            })
          })
        }
      >
        {isPending ? 'processing...' : 'Telah Diterima'}
      </Button>
    )
  }

  return (
    <>
      <h1 className="py-4 text-2xl"> Pesanan {formatId(order.id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="overflow-x-auto md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Metode Pembayaran</h2>
              <p>{paymentMethod}</p>
              {isPaid ? (
                <Badge variant="secondary">
                  Dibayar {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Belum dibayar</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Detail Penerima</h2>
              <p className="text-l pb-4">{shippingAddress.shipmentMethod}</p>
              <p>{shippingAddress.fullName}</p>
              <p>{shippingAddress.phoneNumber}</p>
              <p>
                {shippingAddress.streetAddress} {shippingAddress.city}{' '}
                {shippingAddress.postalCode}
              </p>

              {isDelivered ? (
                <Badge variant="secondary">
                  {shippingAddress.shipmentMethod === 'Diambil'
                    ? `Telah diambil ${formatDateTime(deliveredAt!).dateTime}`
                    : `Telah dikirim ${formatDateTime(deliveredAt!).dateTime}`}
                </Badge>
              ) : (
                <Badge variant="destructive">
                  {shippingAddress.shipmentMethod === 'Diambil'
                    ? 'Belum diambil'
                    : 'Belum dikirim'}
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Barang pesanan</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Kuantitas</TableHead>
                    <TableHead>Harga</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          ></Image>
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        Rp. {item.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 space-y-4 gap-4">
              <h2 className="text-xl pb-4">Ringkasan pesanan</h2>
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Pajak</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Jasa pengiriman</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {!isPaid && paymentMethod === 'Paypal' && (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePayPalOrder}
                      onApprove={handleApprovePayPalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              )}
              {!isPaid && paymentMethod === 'CashOnDelivery' && (
                <MarkAsPaidButton />
              )}
              {isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton />}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
