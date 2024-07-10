'use client'

import slugify from 'slugify'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { createProduct, updateProduct } from '@/lib/actions/product-actions'
import { productDefaultValues } from '@/lib/constants'
import { insertProductSchema, updateProductSchema } from '@/lib/validator'
import { Product } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UploadButton } from '@/lib/uploadthing'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getAllCategories } from '@/lib/actions/categories-action'

export default function ProductForm({
  type,
  product,
  productId,
}: {
  type: 'Create' | 'Update'
  product?: Product
  productId?: string
}) {
  const router = useRouter()
  const { toast } = useToast()

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  )

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await getAllCategories()
        setCategories(response.category_name)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))

  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver:
      type === 'Update'
        ? zodResolver(updateProductSchema)
        : zodResolver(insertProductSchema),
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
  })

  async function onSubmit(values: z.infer<typeof insertProductSchema>) {
    try {
      if (type === 'Create') {
        const res = await createProduct(values)
        handleResponse(res)
      }
      if (type === 'Update') {
        if (!productId) {
          router.push(`/admin/products`)
          return
        }
        const res = await updateProduct({ ...values, id: productId })
        handleResponse(res)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  function handleResponse(res: any) {
    if (!res.success) {
      toast({
        variant: 'destructive',
        description: res.message,
      })
    } else {
      toast({
        description: res.message,
      })
      router.push(`/admin/products`)
    }
  }

  console.log(form.formState.errors)
  const images = form.watch('images')

  return (
    <Form {...form}>
      <form
        method="post"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama produk" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Masukkan slug produk"
                      className="pl-8"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        form.setValue(
                          'slug',
                          slugify(form.getValues('name'), { lower: true })
                        )
                      }}
                    >
                      Generate
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Harga</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan harga produk" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Stok</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Masukkan stok produk"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Kategori</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    value={field.value || ''}
                    className="select w-full"
                  >
                    <option value="">Pilih kategori</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className="space-y-2 mt-2 min-h-48">
                    <div className="flex-start space-x-2">
                      {images.map((image: string, index: number) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`product image ${index}`}
                          className="w-20 h-20 object-cover object-center rounded-sm"
                          width={100}
                          height={100}
                        />
                      ))}
                      <FormControl>
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res: any) => {
                            form.setValue('images', [...images, res[0]?.url])
                          }}
                          onUploadError={(error: Error) => {
                            toast({
                              variant: 'destructive',
                              description: `ERROR! ${error.message}`,
                            })
                          }}
                        />
                      </FormControl>
                    </div>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Masukkan deskripsi produk"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input
                    placeholder="
                    Masukkan unit produk"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="button col-span-2 w-full"
          >
            {form.formState.isSubmitting ? 'Submitting...' : `${type} Produk `}
          </Button>
        </div>
      </form>
    </Form>
  )
}
