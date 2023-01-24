'use client'

import '../../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { Fragment, ReactNode } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { renderWalletConnectComponent } from '../../src/walletUtils'
import Image from 'next/image'
import { AppContextProvider } from '../../src/context'
import { WagmiConfig } from 'wagmi'
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chains, wagmiClient } from '../../src/wagmiContext'
import Link from 'next/link'
import { classNames } from '../../src/utils'
import { usePathname } from 'next/navigation'

export default function RootLayout ({
  children
}: {
  children: ReactNode;
}) {
  const pathname = usePathname()
  const navigation = [
    {
      name: 'Referral',
      href: '/referral'
    },
    {
      name: 'Leaderboard',
      href: '/referral/leaderboard'
    }
  ]

  const renderLayout = () => (
    <div className="relative bg-white overflow-hidden min-h-screen">
      <div className="relative pt-6 pb-16 sm:pb-24">
        <Popover>
          <nav
            className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6"
            aria-label="Global"
          >
            <div className="flex items-center">
              <div className="flex items-center justify-between w-full md:w-auto">
                <span className="sr-only">Tacit</span>
                <Image
                  className="h-8 w-24 sm:h-10"
                  width={489}
                  height={284}
                  src="/pooltogether.png"
                  alt=""
                />
                <div className="-mr-2 flex items-center md:hidden">
                  <Popover.Button
                    className="bg-background rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus-ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    pathname === item.href ? 'bg-gray-100 text-gray-900' : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                    'rounded-md py-2 px-3 inline-flex items-center text-sm font-medium'
                  )}
                >
                  {item.name}
                </Link>
              ))}
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
              <div className="rounded-md shadow-md bg-white ring-1 ring-black ring-opacity-5">
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
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>
        {children}
      </div>
    </div>
  )

  return <AppContextProvider>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        appInfo={{
          appName: 'Tacit Web3',
          learnMoreUrl: 'https://www.tacit.so'
        }}
        chains={chains}
        theme={lightTheme({
          accentColor: '#6E3DD9',
          accentColorForeground: 'white',
          borderRadius: 'small',
          fontStack: 'system'
        })}
        modalSize="compact"
      >
        {renderLayout()}
      </RainbowKitProvider>
    </WagmiConfig>
  </AppContextProvider>
}
