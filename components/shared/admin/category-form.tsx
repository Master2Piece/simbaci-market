'use client'

import { categoryDefaultValues } from '@/lib/constants'
import { insertCategorySchema, updateCategorySchema } from '@/lib/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import { Category } from '@/types'
import { createCategory, updateCategory } from '@/lib/actions/categories-action'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const CategoryForm = ({
  type,
  category,
  categoryId,
}: {
  type: 'Create' | 'Update'
  category?: Category
  categoryId?: string
}) => {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof insertCategorySchema>>({
    resolver:
      type === 'Update'
        ? zodResolver(updateCategorySchema)
        : zodResolver(insertCategorySchema),
    defaultValues:
      category && type === 'Update' ? category : categoryDefaultValues,
  })

  async function onSubmit(values: z.infer<typeof insertCategorySchema>) {
    try {
      if (type === 'Create') {
        const res = await createCategory(values)
        handleResponse(res)
      }
      if (type === 'Update') {
        if (!categoryId) {
          router.push(`/admin/categories`)
          return
        }
        const res = await updateCategory({ ...values, id: categoryId })
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
      router.push(`/admin/categories`)
    }
  }

  return (
    <Form {...form}>
      <form
        method="post"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan nama kategori" />
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
            {form.formState.isSubmitting ? 'Submitting...' : `${type} Kategori`}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default CategoryForm
