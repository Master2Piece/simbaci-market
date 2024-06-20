import { NextResponse } from "next/server";
const midtransClient = require("midtrans-client");

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SECRET_KEY,
  clientKey: process.env.MIDTRANS_PUBLIC_KEY,
});

export async function POST(request: any) {
  const { transaction_details, item_details } = await request.json();

  let parameter = {
    item_details: item_details,
    transaction_details: {
      order_id: transaction_details.order_id,
      gross_amount: transaction_details.gross_amount,
    },
  };

  try {
    const token = await snap.createTransactionToken(parameter);
    return NextResponse.json({token});
  } catch (error) {
    console.error("Midtrans error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction token" },
      { status: 500 }
    );
  }
}
