import { Metadata } from 'next'

import { APP_NAME } from '@/lib/constants'
import { auth } from '@/auth'
import { getUserById } from '@/lib/actions/user-actions'
import PaymentMethodForm from './payment-method-form'

export const metadata: Metadata = {
  title: `Metode Pembayaran - ${APP_NAME}`,
}

export default async function PaymentMethodPage() {
  const session = await auth()
  const user = await getUserById(session?.user.id!)
  return <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
}
