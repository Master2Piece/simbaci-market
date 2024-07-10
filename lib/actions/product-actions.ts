'use server'

import { and, count, desc, ilike, sql } from 'drizzle-orm'

import db from '@/db/drizzle'
import { categories, products } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { PAGE_SIZE } from '../constants'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { insertProductSchema, updateProductSchema } from '../validator'
import { z } from 'zod'
import { Product } from '@/types'

// CREATE
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data)
    await db.insert(products).values(product)
    console.log('Produk dibuat:', product)

    revalidatePath('/admin/products')
    return {
      success: true,
      message: 'Produk berhasil ditambahkan',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data)
    const productExists = await db.query.products.findFirst({
      where: eq(products.id, product.id),
    })
    if (!productExists) throw new Error('Produk tidak ditemukan')
    await db
      .update(products)
      .set({
        ...product,
      })
      .where(eq(products.id, product.id))
    revalidatePath('/admin/products')
    return {
      success: true,
      message: 'Produk berhasil diperbarui',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET
export async function getProductById(productId: string) {
  return await db.query.products.findFirst({
    where: eq(products.id, productId),
  })
}

export async function getLatestProducts() {
  const data = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    limit: 4,
  })
  return data
}

export async function getProductBySlug(slug: string) {
  return await db.query.products.findFirst({
    where: eq(products.slug, slug),
  })
}

export async function getProducts() {
  const data = await db.query.products.findMany({})
  return data
}

export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  sort,
}: {
  query: string
  category: string
  limit?: number
  page: number
  price?: string
  rating?: string
  sort?: string
}): Promise<{ data: Product[]; totalPages: number }> {
  const queryFilter =
    query && query !== 'all' ? ilike(products.name, `%${query}%`) : undefined
  const categoryFilter =
    category && category !== 'all'
      ? eq(products.categoryId, category)
      : undefined
  const priceFilter =
    price && price !== 'all'
      ? sql`${products.price} >= ${price.split('-')[0]} AND ${
          products.price
        } <= ${price.split('-')[1]}`
      : undefined
  const order =
    sort === 'Termurah'
      ? products.price
      : sort === 'Termahal'
      ? desc(products.price)
      : desc(products.createdAt)

  const condition = and(queryFilter, categoryFilter, priceFilter)
  const data = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      images: products.images,
      description: products.description,
      stock: products.stock,
      price: products.price,
      isFeatured: products.isFeatured,
      category: categories.name,
      createdAt: products.createdAt,
      categoryId: products.categoryId,
      unit: products.unit,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(condition)
    .orderBy(order)
    .offset((page - 1) * limit)
    .limit(limit)

  const dataCount = await db
    .select({ count: count() })
    .from(products)
    .where(condition)

  return {
    data,
    totalPages: Math.ceil(dataCount[0].count / limit),
  }
}

// Get categories with related products
export async function getAllCategories() {
  const data = await db.query.categories.findMany({
    orderBy: [desc(categories.createdAt)],
    with: { products: true },
  })
  return data
}

export async function getFeaturedProducts() {
  const data = await db.query.products.findMany({
    where: eq(products.isFeatured, true),
    orderBy: [desc(products.createdAt)],
    limit: 4,
  })
  return data
}

export async function deleteProduct(id: string) {
  try {
    const productExists = await db.query.products.findFirst({
      where: eq(products.id, id),
    })
    if (!productExists) throw new Error('Product not found')
    await db.delete(products).where(eq(products.id, id))
    revalidatePath('/admin/products')
    return {
      success: true,
      message: 'Product deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
