'use client'

import { Fragment, ReactNode } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import '../../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { renderWalletConnectComponent } from '../../src/walletUtils'
import Image from 'next/image'
import { AppContextProvider } from '../../src/context'
import { WagmiConfig } from 'wagmi'
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chains, wagmiClient } from '../../src/wagmiContext'
import { classNames } from '../../src/utils'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { includes } from 'lodash'

export default function RootLayout ({
  children
}: {
  children: ReactNode;
}) {
  const pathname = usePathname()
  const navigation = [
    {
      name: 'Referral',
      href: '/referral',
      current: includes(['/', '/referral'], pathname)
    },
    {
      name: 'Leaderboard',
      href: '/referral/leaderboard/top',
      current: pathname && pathname.indexOf('/leaderboard') > -1
    }
  ]

  // const user = {
  //   name: 'Chelsea Hagon',
  //   email: 'chelsea.hagon@example.com',
  //   imageUrl:
  //     'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  // }
  // const navigation = [
  //   {
  //     name: 'Dashboard',
  //     href: '#',
  //     current: true
  //   },
  //   {
  //     name: 'Calendar',
  //     href: '#',
  //     current: false
  //   },
  //   {
  //     name: 'Teams',
  //     href: '#',
  //     current: false
  //   },
  //   {
  //     name: 'Directory',
  //     href: '#',
  //     current: false
  //   }
  // ]
  const userNavigation = [
    // {
    //   name: 'Your Profile',
    //   href: '#'
    // },
    // {
    //   name: 'Settings',
    //   href: '#'
    // },
    // {
    //   name: 'Sign out',
    //   href: '#'
    // }
  ]

  const renderNavbar = () => {
    return <>
      {/* When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars */}
      <Popover
        as="header"
        className={({ open }) =>
          classNames(
            open ? 'fixed inset-0 z-40 overflow-y-auto' : '',
            'bg-white shadow-sm lg:static lg:overflow-y-visible'
          )
        }
      >
        {({ open }) => (
          <>
            <div className="h-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-3 relative flex justify-between lg:gap-8 xl:grid xl:grid-cols-12">
                <div className="flex xl:col-span-4">
                  <div className="flex flex-shrink-0 items-center">
                    <Link href="/referral">
                      <Image
                        className="block h-8 w-auto"
                        src="/pooltogether.png"
                        alt="PoolTogether"
                        width="489"
                        height="284"
                      />
                    </Link>
                  </div>
                </div>

                <div className="hidden md:flex md:px-8 lg:px-0 xl:col-span-4">
                  <div className="flex space-x-4">
                    {navigation.map((item: {current: boolean, name: string, href: string}) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        className={classNames(
                          item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                          'rounded-md py-2 px-3 inline-flex items-center text-sm font-medium'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  {/*   <div className="flex items-center px-6 py-4 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none xl:px-0"> */}
                  {/*     <div className="w-full"> */}
                  {/*       <label htmlFor="search" className="sr-only"> */}
                  {/*         Search */}
                  {/*       </label> */}
                  {/*       <div className="relative"> */}
                  {/*         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"> */}
                  {/*           <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" /> */}
                  {/*         </div> */}
                  {/*         <input */}
                  {/*           id="search" */}
                  {/*           name="search" */}
                  {/*           className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm" */}
                  {/*           placeholder="Search" */}
                  {/*           type="search" */}
                  {/*         /> */}
                  {/*       </div> */}
                  {/*     </div> */}
                  {/*   </div> */}
                </div>
                <div className="flex items-center md:absolute md:inset-y-0 md:right-0 md:hidden">
                  {/* Mobile menu button */}
                  <Popover.Button
                    className="-mx-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open menu</span>
                    {open
                      ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                        )
                      : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                        )}
                  </Popover.Button>
                </div>
                <div className="hidden md:flex md:items-center md:justify-end xl:col-span-4">
                  {pathname === '/referral' && renderWalletConnectComponent()}
                </div>
              </div>
            </div>

            <Popover.Panel as="nav" className="lg:hidden" aria-label="Global">
              <div className="mx-auto max-w-3xl space-y-1 px-2 pt-2 pb-3 sm:px-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50',
                      'block rounded-md py-2 px-3 text-base font-medium'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 pb-3">
                {/* <div className="mx-auto flex max-w-3xl items-center px-4 sm:px-6"> */}
                {/*   <div className="flex-shrink-0"> */}
                {/*     <img className="h-10 w-10 rounded-full" src={user.imageUrl} alt="" /> */}
                {/*   </div> */}
                {/*   <div className="ml-3"> */}
                {/*     <div className="text-base font-medium text-gray-800">{user.name}</div> */}
                {/*     <div className="text-sm font-medium text-gray-500">{user.email}</div> */}
                {/*   </div> */}
                {/*   <button */}
                {/*     type="button" */}
                {/*     className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" */}
                {/*   > */}
                {/*     <span className="sr-only">View notifications</span> */}
                {/*     <BellIcon className="h-6 w-6" aria-hidden="true" /> */}
                {/*   </button> */}
                {/* </div> */}
                <div className="mx-auto mt-3 max-w-3xl space-y-1 px-2 sm:px-4">
                  {userNavigation.map((item: {current: boolean, name: string, href: string}) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block rounded-md py-2 px-3 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </>
  }

  const renderLayout = () => (
    <>
      {renderNavbar()}
      {children}
    </>
  )
  // eslint-disable-next-line no-unused-vars
  const renderLayoutOld = () => (
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
            <div className="hidden md:flex space-x-4">
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
