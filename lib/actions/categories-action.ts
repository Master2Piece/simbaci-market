'use server'

import db from '@/db/drizzle'
import { categories, products } from '@/db/schema'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { insertCategorySchema, updateCategorySchema } from '../validator'
import { revalidatePath } from 'next/cache'

export async function getAllCategories() {
  try {
    // Fetch categories with related products
    const categoryData = await db.query.categories.findMany({
      orderBy: [asc(categories.name)],
      with: { products: true }, // Fetch related products
    })

    // Format the response to ensure it matches the expected structure
    const formattedCategories = categoryData.map((category) => ({
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
    }))

    return {
      category_name: formattedCategories,
    }
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Create a new category
export async function createCategory(
  data: z.infer<typeof insertCategorySchema>
) {
  try {
    // Insert the new category into the database
    const newCategory = insertCategorySchema.parse(data)
    await db.insert(categories).values(newCategory)

    revalidatePath('/admin/categories')
    return {
      success: true,
      message: 'Kategori berhasil ditambahkan',
    }
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Update an existing category
export async function updateCategory(
  data: z.infer<typeof updateCategorySchema>
) {
  try {
    // Update the category in the database
    const category = updateCategorySchema.parse(data)
    const categoryExists = await db.query.categories.findFirst({
      where: eq(categories.id, category.id),
    })
    if (!categoryExists) throw new Error('Kategori tidak ditemukan')
    await db
      .update(categories)
      .set({
        ...category,
      })
      .where(eq(categories.id, category.id))

    revalidatePath('/admin/categories')
    return {
      success: true,
      message: 'Kategori berhasil diperbarui',
    }
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Get category by ID
export async function getCategoryById(categoryId: string) {
  // Fetch the category by ID
  return await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
  })
}

// Delete a category
export async function deleteCategory(categoryId: string) {
  try {
    // check if the category exists in products
    const categoryExistsInProducts = await db.query.products.findFirst({
      where: eq(products.categoryId, categoryId),
    })
    if (categoryExistsInProducts)
      return {
        success: false,
        message:
          'Kategori tidak dapat dihapus karena terdapat produk yang terkait harap mengganti kategori produk terlebih dahulu',
      }

    // Delete the category
    await db.delete(categories).where(eq(categories.id, categoryId))

    revalidatePath('/admin/categories')
    return {
      success: true,
      message: 'Kategori berhasil dihapus',
    }
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
