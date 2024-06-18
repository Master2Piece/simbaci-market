'use server'

import db from '@/db/drizzle'
import { categories } from '@/db/schema'
import { asc } from 'drizzle-orm'

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
    console.error('Error fetching categories:', error)
    throw error
  }
}
