import React from 'react'
import { APP_NAME } from '@/lib/constants'
import { getMyCart } from '@/lib/actions/cart-actions'
import { auth } from '@/auth'
import { getUserById } from '@/lib/actions/user-actions'
import { redirect } from 'next/navigation'
import CheckoutSteps from '@/components/shared/checkout-steps'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import PlaceOrderForm from './place-order-form'

export const metadata = {
  title: `Pesanan - ${APP_NAME}`,
}

export default async function PlaceOrderPage() {
  const cart = await getMyCart()
  const session = await auth()
  const user = await getUserById(session?.user.id!)
  if (!cart || cart.items.length === 0) redirect('/cart')
  if (!user.address) redirect('/shipping-address')
  if (!user.paymentMethod) redirect('/payment-method')

  return (
    <>
      <CheckoutSteps current={3} />
      <h1 className="py-4 text-2xl">Pesanan</h1>

      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="overflow-x-auto md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">
                Detail Penerima - {user.address.shipmentMethod}
              </h2>
              <p>{user.address.fullName}</p>
              <p>{user.address.phoneNumber}</p>
              <p>
                {user.address.streetAddress}
                {user.address.city}
                {user.address.postalCode}
              </p>
              <div>
                <Link href="/shipping-address">
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Metode pembayaran</h2>
              <p>{user.paymentMethod}</p>
              <div>
                <Link href="/payment-method">
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
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
                  {cart.items.map((item) => (
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
              <Link href="/cart">
                <Button variant="outline">Edit</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(cart.itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Pajak</div>
                <div>{formatCurrency(cart.taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Jasa pengiriman</div>
                <div>{formatCurrency(cart.shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(cart.totalPrice)}</div>
              </div>
              <PlaceOrderForm cart={cart} paymentMethod={user.paymentMethod} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
