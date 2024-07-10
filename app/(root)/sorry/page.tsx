// midtrans failed
import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center w-full p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Pembayaran Gagal</h1>
      <p className="mb-10">Pembayaran Anda tidak berhasil diproses.</p>
      <div className="flex gap-5">
        <Link href="/user/orders">
          <Button className="w-full">Lihat Pesanan</Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="w-full">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  )
}
