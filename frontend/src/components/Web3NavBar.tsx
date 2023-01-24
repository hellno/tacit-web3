import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { renderWalletConnectComponent } from '../walletUtils'
import Image from 'next/image'
import Link from 'next/link'

const navigation = [// {name: 'Product', href: '#'},
  // {name: 'Features', href: '#'},
  // {name: 'Marketplace', href: '#'},
  // {name: 'Company', href: '#'},
]

const Web3NavBar = () =>
  <Popover>
    <nav
      className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6"
      aria-label="Global"
    >
      <div className="flex items-center flex-1">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/">
            <span className="sr-only">Tacit</span>
            <Image
              className="h-8 w-auto sm:h-10"
              src="/tacit_t.png"
              height="35"
              width="35"
              alt=""
            />
          </Link>
          <div className="-mr-2 flex items-center md:hidden">
            <Popover.Button
              className="bg-background rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus-ring-inset focus:ring-white">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </Popover.Button>
          </div>
        </div>
        <div className="hidden space-x-10 md:flex md:ml-10">
          {navigation.map((item) => (<a
            key={item.name}
            href={item.href}
            className="font-medium text-white hover:text-gray-300"
          >
            {item.name}
          </a>))}
        </div>
      </div>
      <div className="hidden md:flex">
        {renderWalletConnectComponent()}
      </div>
    </nav>

    <Transition
      as={Fragment}
      enter="duration-150 ease-out"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="duration-100 ease-in"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Popover.Panel
        focus
        className="absolute z-10 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
      >
        <div className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5">
          <div className="px-5 py-2 flex items-center justify-between">
            <div className="block w-full">
              {renderWalletConnectComponent()}
            </div>
            <div className="-mr-2">
              <Popover.Button
                className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-100 focus:outline-none">
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-7 w-7" aria-hidden="true" />
              </Popover.Button>
            </div>
          </div>
          {/* <div className="px-5 pt-2 pb-6 space-y-1"> */}
          {/*   /!* weird behaviour -> overflow-y-visible */}
          {/*                           this div has extra padding in the bottom so that */}
          {/*                           the chain switcher component has a layer to be rendered on *!/ */}
          {/*   /!* {isWalletConnected && <Web3ChainSwitcher />} *!/ */}
          {/* </div> */}
        </div>
      </Popover.Panel>
    </Transition>
  </Popover>

export default Web3NavBar
