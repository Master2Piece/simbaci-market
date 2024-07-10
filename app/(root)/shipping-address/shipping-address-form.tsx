'use client'

import CheckoutSteps from '@/components/shared/checkout-steps'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { updateUserAddress } from '@/lib/actions/user-actions'
import { shippingAddressDefaultValues } from '@/lib/constants'
import { shippingAddressSchema } from '@/lib/validator'
import { shippingAddress } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

export default function ShippingAddressForm({
  address,
}: {
  address: shippingAddress | null
}) {
  const router = useRouter()
  const [shipmentMethod, setShipmentMethod] = useState('')
  const form = useForm<shippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  })
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const onSubmit: SubmitHandler<shippingAddress> = async (values) => {
    startTransition(async () => {
      const res = await updateUserAddress(values)
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
        return
      }
      router.push('/payment-method')
    })
  }

  return (
    <>
      <CheckoutSteps current={1} />
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Alamat Pengiriman</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan alamat pengiriman Anda
        </p>
        <Form {...form}>
          <form
            method="post"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="shipmentMethod"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Metode Pengiriman</FormLabel>
                  <Select
                    value={shipmentMethod}
                    onValueChange={(value) => {
                      field.onChange(value) // Menambahkan ini untuk memastikan field.onChange dipanggil
                      setShipmentMethod(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode pengiriman" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Diantar">Diantar</SelectItem>
                      <SelectItem value="Diambil">Diambil</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {shipmentMethod === 'Diantar' && (
              <>
                <FormField
                  control={form.control}
                  name="streetAddress"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan alamat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-5 md:flex-row">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Kota</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan kota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Kode pos</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan kode pos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nomor telepon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader className="animate-spin w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Lanjut
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}
