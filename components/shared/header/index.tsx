import Image from 'next/image'
import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'
import Menu from './menu'

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex justify-between items-center px-4 py-2">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="w-12 md:w-24">
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
        </div>
        <Menu />
      </div>
    </header>
  )
}

export default Header
