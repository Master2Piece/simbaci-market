"use server";

import { auth } from "@/auth";
import { getMyCart } from "./cart-actions";
import { getUserById } from "./user-actions";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { carts, orderItems, orders, products, users } from "@/db/schema";
import { count, desc, eq, sql, sum } from "drizzle-orm";
import { isRedirectError } from "next/dist/client/components/redirect";
import { formatError } from "../utils";
import { insertOrderSchema } from "../validator";
import { paypal } from "../paypal";
import { paymentResult } from "@/types";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";

export async function getOrderById(orderId: string) {
  return await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      orderItems: true,
      user: { columns: { name: true, email: true } },
    },
  });
}

export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) throw new Error("User tidak terautentikasi");

  const data = await db.query.orders.findMany({
    where: eq(orders.userId, session.user.id!),
    orderBy: [desc(products.createdAt)],
    limit,
    offset: (page - 1) * limit,
  });
  const dataCount = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.userId, session.user.id!));

  return {
    data,
    totalPages: Math.ceil(dataCount[0].count / limit),
  };
}

export async function getOrderSummary() {
  const ordersCount = await db.select({ count: count() }).from(orders);
  const productsCount = await db.select({ count: count() }).from(products);
  const usersCount = await db.select({ count: count() }).from(users);
  const ordersPrice = await db
    .select({ sum: sum(orders.totalPrice) })
    .from(orders);

  const salesData = await db
    .select({
      months: sql<string>`to_char(${orders.createdAt},'MM/YY')`,
      totalSales: sql<number>`sum(${orders.totalPrice})`.mapWith(Number),
    })
    .from(orders)
    .groupBy(sql`1`);
  const latestOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: {
      user: { columns: { name: true } },
    },
    limit: 6,
  });
  return {
    ordersCount,
    productsCount,
    usersCount,
    ordersPrice,
    salesData,
    latestOrders,
  };
}

export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const data = await db.query.orders.findMany({
    orderBy: [desc(products.createdAt)],
    limit,
    offset: (page - 1) * limit,
    with: { user: { columns: { name: true } } },
  });
  const dataCount = await db.select({ count: count() }).from(orders);

  return {
    data,
    totalPages: Math.ceil(dataCount[0].count / limit),
  };
}

// CREATE
export const createOrder = async ({ isPaid }: { isPaid: boolean }) => {
  try {
    const session = await auth();
    if (!session) throw new Error("User tidak ditemukan");
    const cart = await getMyCart();
    const user = await getUserById(session?.user.id!);
    if (!cart || cart.items.length === 0) redirect("/cart");
    if (!user.address) redirect("/shipping-address");
    if (!user.paymentMethod) redirect("/payment-method");

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      shipmentMethod: user.address.shipmentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
      isPaid: isPaid
    });
    const insertedOrderId = await db.transaction(async (tx) => {
      const insertedOrder = await tx.insert(orders).values(order).returning();
      for (const item of cart.items) {
        await tx.insert(orderItems).values({
          ...item,
          price: item.price.toFixed(2),
          orderId: insertedOrder[0].id,
        });
      }
      await db
        .update(carts)
        .set({
          items: [],
          totalPrice: "0",
          shippingPrice: "0",
          taxPrice: "0",
          itemsPrice: "0",
        })
        .where(eq(carts.id, cart.id));
      return insertedOrder[0].id;
    });
    if (!insertedOrderId) throw new Error("Pesanan gagal dibuat");
    redirect(`/order/${insertedOrderId}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
};

export async function createPayPalOrder(orderId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    if (order) {
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));
      await db
        .update(orders)
        .set({
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: "0",
          },
        })
        .where(eq(orders.id, orderId));
      return {
        success: true,
        message: "Pesanan berhasil dibuat di PayPal",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("Pesanan tidak ditemukan");
    }
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    if (!order) throw new Error("Order not found");

    const captureData = await paypal.capturePayment(data.orderID);
    if (
      !captureData ||
      captureData.id !== order.paymentResult?.id ||
      captureData.status !== "COMPLETED"
    )
      throw new Error("Error in paypal payment");
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });
    revalidatePath(`/order/${orderId}`);
    return {
      success: true,
      message: "Pesanan berhasil dibayar melalui PayPal",
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// DELETE
export async function deleteOrder(id: string) {
  try {
    await db.delete(orders).where(eq(orders.id, id));
    revalidatePath("/admin/orders");
    return {
      success: true,
      message: "Pesanan berhasil dihapus",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export const updateOrderToPaid = async ({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: paymentResult;
}) => {
  const order = await db.query.orders.findFirst({
    columns: { isPaid: true },
    where: eq(orders.id, orderId),
    with: { orderItems: true },
  });
  if (!order) throw new Error("Pesanan tidak ditemukan");
  if (order.isPaid) throw new Error("Pesanan sudah dibayar");
  await db.transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.qty}` })
        .where(eq(products.id, item.productId));
    }
    await tx
      .update(orders)
      .set({ isPaid: true, paidAt: new Date(), paymentResult })
      .where(eq(orders.id, orderId));
  });
};

export async function updateOrderToPaidByCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "Pesanan berhasil dibayar" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function deliverOrder(orderId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    if (!order) throw new Error("Pesanan tidak ditemukan");
    if (!order.isPaid) throw new Error("Pesanan belum dibayar");
    order.isDelivered = true;
    order.deliveredAt = new Date();
    await db
      .update(orders)
      .set({
        isDelivered: true,
        deliveredAt: new Date(),
        status: 'Selesai',
      })
      .where(eq(orders.id, orderId));
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "Pesanan berhasil dikirim" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}
