import * as z from 'zod'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { formatNumberWithDecimal } from '@/lib/utils'
import { PAYMENT_METHODS } from './constants'
import { categories, orderItems, orders, products } from '@/db/schema'

// USER
export const signInFormSchema = z.object({
  email: z.string().email().min(3, 'Email minimal 3 karakter'),
  password: z.string().min(3, 'Password minimal 3 karakter'),
})

export const signUpFormSchema = z
  .object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().min(3, 'Email minimal 3 karakter'),
    password: z.string().min(3, 'Password minimal 3 karakter'),
    confirmPassword: z
      .string()
      .min(3, 'Konfirmasi password minimal 3 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password tidak sama',
    path: ['confirmPassword'],
  })

export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nama harus diisi minimal 3 karakter'),
  email: z.string().email().min(3, 'Email must be at least 3 characters'),
})

export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, 'Id is required'),
  role: z.string().min(1, 'Role is required'),
})

export const insertProductSchema = createSelectSchema(products, {
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  images: z.array(z.string()).min(1, 'Minimal 1 gambar produk'),
  stock: z.coerce.number(),
}).omit({
  id: true,
  createdAt: true,
})

export const updateProductSchema = createSelectSchema(products, {
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  images: z.array(z.string()).min(1, 'Minimal 1 gambar produk'),
  stock: z.coerce.number().min(1, 'Stok minimal 0'),
}).omit({
  createdAt: true,
})

// CART
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Produk id harus diisi'),
  name: z.string().min(1, 'Nama produk harus diisi'),
  slug: z.string().min(1, 'Slug harus diisi'),
  qty: z.number().int().nonnegative('Kuantitas minimal 0'),
  image: z.string().min(1, 'Gambar produk harus diisi'),
  price: z
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
      'Harga tidak valid'
    ),
})

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  shipmentMethod: z.string().default('Dikirim'),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, 'Metode pembayaran harus diisi'),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ['type'],
    message: 'Metode pembayaran tidak valid',
  })

export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
})

export const insertOrderSchema = createInsertSchema(orders, {
  shippingAddress: shippingAddressSchema,
  paymentResult: z
    .object({
      id: z.string(),
      status: z.string(),
      email_address: z.string(),
      pricePaid: z.string(),
    })
    .optional(),
})

export const insertOrderItemSchema = createInsertSchema(orderItems, {
  price: z.number(),
})

// insert data in category schema
export const insertCategorySchema = createInsertSchema(categories, {
  name: z.string().min(3, 'Nama kategori minimal 3 karakter'),
}).omit({
  id: true,
  createdAt: true,
})

// update data in category schema
export const updateCategorySchema = createSelectSchema(categories, {
  name: z.string().min(3, 'Nama kategori minimal 3 karakter'),
}).omit({
  createdAt: true,
})
