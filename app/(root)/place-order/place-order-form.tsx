"use client";

import { Check, Loader } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Cart } from "@/types";
import { createOrder } from "@/lib/actions/order-actions";

declare var window: {
  snap: any;
  [key: string]: any;
};

export default function PlaceOrderForm({
  paymentMethod,
  cart,
}: {
  paymentMethod: string;
  cart: Cart;
}) {
  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.MIDTRANS_PUBLIC_KEY;
    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey || "");
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (paymentMethod === "Midtrans") {
      try {
        // Data yang akan dikirim ke API tokenizer
        const data = {
          item_details: cart.items.map((item: any) => ({
            id: item.productId,
            price: item.price,
            quantity: item.qty,
            name: item.name,
          })),
          transaction_details: {
            order_id: cart.id + Date.now(),
            gross_amount: cart.totalPrice,
          },
        };
        // Mengirim data ke API tokenizer
        const resp = await fetch(
          `${process.env.BASE_URL}/api/tokenizer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        // Memeriksa apakah permintaan berhasil
        if (!resp.ok) {
          throw new Error("Network response was not ok");
        }

        // Mengambil data dari respon
        const requestData = await resp.json();

        window.snap.pay(requestData.token, {
          onSuccess: async (result: any) => {
            // Call the createOrder function to insert the order into the database
            await createOrder({ isPaid: true });
            alert("Payment successful and order placed!");
          },
          onError: (error: any) => {
            console.error("Payment failed:", error);
            alert("Payment failed. Please try again.");
          },
        });
      } catch (error) {
        // Penanganan kesalahan
        console.error("Error during the checkout process:", error);
        alert(
          "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi."
        );
      }
    } else {
      alert("Metode Pembayaran tidak tersedia!");
    }
  };

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button disabled={pending} className="w-full">
        {pending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}{" "}
        Pesan
      </Button>
    );
  };

  return (
    <form onClick={handleCheckout} className="w-full">
      <PlaceOrderButton />
      {/* {!data.success && <p className="text-destructive py-4">{data.message}</p>} */}
    </form>
  );
}
