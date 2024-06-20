import Link from "next/link";
import React from "react";

export default function Page() {
  return (
    <div className="flex items-center justify-center w-full">
      Terimakasih sudah melakukan pembayaran!
      <div className="flex gap-5 mt-10">
        <Link href="/user/orders">Lihat Order</Link>
        <Link href="/">Kembali</Link>
      </div>
    </div>
  );
}
