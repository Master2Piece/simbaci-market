import { carts, categories, orderItems, orders, products } from '@/db/schema'
import { InferSelectModel } from 'drizzle-orm'
import { z } from 'zod'
import { cartItemSchema, paymentResultSchema } from '@/lib/validator'
import { shippingAddressSchema } from '@/lib/validator'

// PRODUCTS
export type Product = InferSelectModel<typeof products>

// CART
export type Cart = InferSelectModel<typeof carts>
export type CartItem = z.infer<typeof cartItemSchema>

export type shippingAddress = z.infer<typeof shippingAddressSchema>
export type paymentResult = z.infer<typeof paymentResultSchema>

// ORDER
export type Order = InferSelectModel<typeof orders> & {
  orderItems: CartItem[]
  user: {
    name: string | null
    email: string
  }
}
export type OrderItem = InferSelectModel<typeof orderItems>

export type Category = InferSelectModel<typeof categories>
