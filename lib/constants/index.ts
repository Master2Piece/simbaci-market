export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Simbaci-Market'
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  'An E-waste Ecommerce built with Next.js, Postgres, Shadcn'

export const signInDefaultValues = {
  email: '',
  password: '',
}

export const signUpDefaultValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export const shippingAddressDefaultValues = {
  fullName: '',
  streetAddress: '',
  city: '',
  postalCode: '',
  phoneNumber: '',
}

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(', ')
  : ['Via Website', 'Paypal', 'CashOnDelivery']

export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || 'Paypal'

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(', ')
  : ['admin', 'user']

export const SHIPMENT_METHODS = process.env.SHIPMENT_METHODS
  ? process.env.SHIPMENT_METHODS.split(', ')
  : ['diambil', 'dikirim']

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 3

export const productDefaultValues = {
  name: '',
  slug: '',
  description: '',
  stock: 0,
  price: '0',
  isFeatured: false,
  categoryId: null,
  images: [],
}
