'use client'

import { Button } from '@/components/ui/button'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart-actions'
import { round2 } from '@/lib/utils'
import { Cart, CartItem } from '@/types'
import { Loader, Minus, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export default function AddToCart({
  cart,
  item,
}: {
  cart?: Cart
  item: Omit<CartItem, 'cartId'>
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId)
  return existItem ? (
    <div>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const res = await removeItemFromCart(item.productId)
            toast({
              variant: res.success ? 'default' : 'destructive',
              description: res.message,
            })
            return
          })
        }}
      >
        {isPending ? (
          <Loader className="w-4 h-4  animate-spin" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
      </Button>
      <span className="px-4">{existItem.qty}</span>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const res = await addItemToCart({
              ...item,
              price: item.price,
            })
            toast({
              variant: res.success ? 'default' : 'destructive',
              description: res.message,
            })
            return
          })
        }}
      >
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button
      className="w-full"
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await addItemToCart({
            ...item,
            price: round2(item.price),
          })
          if (!res.success) {
            toast({
              variant: 'destructive',
              description: res.message,
            })
            return
          }
          toast({
            description: `${item.name} telah ditambahkan ke keranjang`,
            action: (
              <ToastAction
                className="bg-primary"
                onClick={() => router.push('/cart')}
                altText="Go to cart"
              >
                Lihat Keranjang
              </ToastAction>
            ),
          })
        })
      }}
    >
      {isPending ? <Loader className="animate-spin" /> : <Plus />} Keranjang
    </Button>
  )
}
