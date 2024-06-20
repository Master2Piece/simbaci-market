import { APP_NAME } from '@/lib/constants'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { MainNav } from './main-nav'
import Menu from '@/components/shared/header/menu'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex flex-col">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="flex items-center">
              <div className="w-12 md:w-36">
                {/* Tailwind classes for responsive width */}
                <Image
                  src="/assets/icons/Logo simbaci.svg"
                  width={50} // Set the maximum width
                  height={50} // Set the maximum height
                  alt={`${APP_NAME} logo`}
                  className="w-full h-auto"
                />
              </div>
            </Link>
            <MainNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <Menu />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
      </div>
    </>
  )
}
