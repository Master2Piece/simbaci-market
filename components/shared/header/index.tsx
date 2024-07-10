import Image from 'next/image'
import Link from 'next/link'
import Menu from './menu'
import Search from './search'
import { APP_NAME } from '@/lib/constants'

const Header = async () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <Link href="/" className="flex-start">
            <Image
              src="/assets/icons/Logo Simbaci.svg"
              width={100}
              height={100}
              alt={`${APP_NAME}logo`}
            />
          </Link>
        </div>
        <div className="hidden md:block">
          <Search />
        </div>
        <Menu />
      </div>
      <div className="md:hidden block   px-5 pb-2">
        <Search />
      </div>
    </header>
  )
}

export default Header
