import { APP_NAME } from '@/lib/constants'
import { getOrderById } from '@/lib/actions/order-actions'
import { notFound } from 'next/navigation'
import OrderDetailsForm from './order-details-form'
import { auth } from '@/auth'

export const metadata = {
  title: `Detail Pesanan - ${APP_NAME}`,
}

const OrderDetailsPage = async ({
  params: { id },
}: {
  params: {
    id: string
  }
}) => {
  const session = await auth()
  const order = await getOrderById(id)
  if (!order) notFound()

  const formattedOrder = {
    ...order,
    orderItems: order.orderItems.map((item) => ({
      ...item,
      price: parseFloat(item.price),
    })),
  }
  return (
    <OrderDetailsForm
      order={formattedOrder}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
      isAdmin={session?.user.role === 'admin' || false}
    />
  )
}

export default OrderDetailsPage
