'use client'

import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Cart } from '@/types'
import Link from 'next/link'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart-actions'
import { ArrowRight, Loader, Minus, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default function CartForm({ cart }: { cart?: Cart }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  return (
    <>
      <h1 className="py-4 h2-bold">Keranjang Belanja</h1>

      {!cart || cart.items.length === 0 ? (
        <div>
          Keranjang kosong. <Link href="/">Kembali</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
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
                    <TableCell className="flex-center gap-2">
                      <Button
                        disabled={isPending}
                        variant="outline"
                        type="button"
                        onClick={() =>
                          startTransition(async () => {
                            const res = await removeItemFromCart(item.productId)
                            if (!res.success) {
                              toast({
                                variant: 'destructive',
                                description: res.message,
                              })
                            }
                          })
                        }
                      >
                        {isPending ? (
                          <Loader className="w-4 h-4  animate-spin" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </Button>
                      <span>{item.qty}</span>
                      <Button
                        disabled={isPending}
                        variant="outline"
                        type="button"
                        onClick={() =>
                          startTransition(async () => {
                            const res = await addItemToCart(item)
                            if (!res.success) {
                              toast({
                                variant: 'destructive',
                                description: res.message,
                              })
                            }
                          })
                        }
                      >
                        {isPending ? (
                          <Loader className="w-4 h-4  animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      Rp. {item.price}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <Card>
              <CardContent className="p-4   gap-4">
                <div className="pb-3 text-xl">
                  Subtotal : {formatCurrency(cart.itemsPrice)}
                </div>
                <Button
                  onClick={() =>
                    startTransition(() => router.push('/shipping-address'))
                  }
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader className="animate-spin w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
