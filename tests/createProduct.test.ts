// test/createProduct.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProduct } from '../lib/actions/product-actions'
import db from '../db/drizzle'
import { revalidatePath } from 'next/cache'
import { insertProductSchema } from '../lib/validator'

// Mock the database and revalidatePath
const mockValues = vi.fn()

vi.mock('../path/to/db', () => ({
  db: {
    insert: () => ({
      values: mockValues,
    }),
  },
}))

vi.mock('../path/to/revalidatePath', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('../path/to/formatError', () => ({
  formatError: vi.fn((error) => `Error: ${error.message}`),
}))

describe('createProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a product successfully', async () => {
    const mockProduct = {
      name: 'Test Product',
      slug: 'test-product',
      categoryId: '7d1ac6b3-f3c2-430a-86cb-32ead7fc9839',
      images: ['image1.jpg', 'image2.jpg'],
      description: 'A test product',
      stock: 10,
      price: '100',
      isFeatured: false,
      unit: 'piece',
    }
    const parsedProduct = insertProductSchema.parse(mockProduct)

    mockValues.mockResolvedValueOnce({})

    const result = await createProduct(mockProduct)

    expect(result).toEqual({
      success: true,
      message: 'Produk berhasil ditambahkan',
    })
    expect(db.insert).toHaveBeenCalledWith('products')
    expect(mockValues).toHaveBeenCalledWith(parsedProduct)
    expect(revalidatePath).toHaveBeenCalledWith('/admin/products')
  })

  it('should return an error if product creation fails', async () => {
    const mockProduct = {
      name: 'Test Product',
      slug: 'test-product',
      categoryId: '7d1ac6b3-f3c2-430a-86cb-32ead7fc9839',
      images: ['image1.jpg', 'image2.jpg'],
      description: 'A test product',
      stock: 10,
      price: '100',
      isFeatured: false,
      unit: 'piece',
    }

    const error = new Error('Test error')
    mockValues.mockRejectedValueOnce(error)

    const result = await createProduct(mockProduct)

    expect(result).toEqual({
      success: false,
      message: `Error: ${error.message}`,
    })
  })

  it('should return an error if data is invalid', async () => {
    const invalidProduct = {
      name: 'Test Product',
      slug: 'test-product',
      categoryId: '7d1ac6b3-f3c2-430a-86cb-32ead7fc9839',
      images: ['image1.jpg', 'image2.jpg'],
      description: 'A test product',
      stock: 10,
      price: '100',
      isFeatured: false,
      // Missing 'unit'
    }

    const result = await createProduct(invalidProduct)

    expect(result).toEqual({
      success: false,
      message: expect.stringContaining('Error:'),
    })
  })
})
