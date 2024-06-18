import { Metadata } from 'next'
import { APP_NAME } from '@/lib/constants'
import { getMyCart } from '@/lib/actions/cart-actions'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getUserById } from '@/lib/actions/user-actions'
import ShippingAddressForm from './shipping-address-form'

export const metadata: Metadata = {
  title: `Alamat Pengiriman - ${APP_NAME}`,
}

export default async function ShippingPage() {
  const cart = await getMyCart()
  if (!cart || cart.items.length === 0) redirect('/cart')
  const session = await auth()
  const user = await getUserById(session?.user.id!)
  return <ShippingAddressForm address={user.address} />
}
