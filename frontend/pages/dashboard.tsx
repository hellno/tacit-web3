/*
  This example requires some changes to your config:

  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { Fragment, useRef, useState } from 'react'
import { Combobox, Dialog, Menu, Transition } from '@headlessui/react'
import {
  ArrowTrendingUpIcon,
  Bars3CenterLeftIcon,
  BellIcon,
  ClockIcon,
  CogIcon,
  DocumentChartBarIcon,
  HomeIcon,
  PlusCircleIcon,
  QuestionMarkCircleIcon,
  ScaleIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import {
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/20/solid'
import Head from 'next/head'
import { find } from 'lodash'

const navigation = [
  {
    name: 'Home',
    href: '#',
    icon: HomeIcon,
    current: true
  },
  {
    name: 'Reward History',
    href: '#',
    icon: ClockIcon,
    current: false
  },
  {
    name: 'Users',
    href: '#',
    icon: UserGroupIcon,
    current: false
  },
  {
    name: 'Reports',
    href: '#',
    icon: DocumentChartBarIcon,
    current: false
  }
]
const secondaryNavigation = [
  {
    name: 'Settings',
    href: '#',
    icon: CogIcon
  },
  {
    name: 'Help',
    href: '#',
    icon: QuestionMarkCircleIcon
  }
  // {
  //   name: 'Privacy',
  //   href: '#',
  //   icon: ShieldCheckIcon
  // }
]
const cards = [
  {
    name: 'User Reward balance',
    href: '#',
    icon: BanknotesIcon,
    amount: 'USDC 80,012',
    cta: 'View pending balances'
  }, {
    name: 'Users Referred',
    href: '#',
    icon: ArrowTrendingUpIcon,
    amount: '2342',
    cta: 'View latest referrals'
  }, {
    name: 'Remaining Reward Treasury',
    href: '#',
    icon: ScaleIcon,
    amount: '$30,659.45'
  }
]
const transactions = [
  {
    id: 1,
    name: 'Payout to 0x6dfc34609a05bc22319fa4cce1d1e2929548c0d7',
    href: '#',
    amount: '200',
    currency: 'USDC',
    status: 'success',
    date: 'July 11, 2022',
    datetime: '2022-07-11'
  }, {
    id: 2,
    name: 'Payout to 0x34de6bdb58e5e78364aad778e0c0533b481c9afc',
    href: '#',
    amount: '1',
    currency: 'WETH',
    status: 'success',
    date: 'July 11, 2022',
    datetime: '2022-07-11'
  }, {
    id: 3,
    name: 'Payout to 0x21a31ee1afc51d94c2efccaa2092ad1028285549',
    href: '#',
    amount: '2.1',
    currency: 'ETH',
    status: 'success',
    date: 'July 11, 2022',
    datetime: '2022-07-11'
  }, {
    id: 4,
    name: 'Payout to 0x34de6bdb58e5e78364aad778e0c0533b481c9afc',
    href: '#',
    amount: '23',
    currency: 'USDC',
    status: 'success',
    date: 'July 11, 2022',
    datetime: '2022-07-11'
  }
]
const statusStyles = {
  success: 'bg-green-100 text-green-800',
  processing: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-gray-100 text-gray-800'
}

function classNames (...classes) {
  return classes.filter(Boolean).join(' ')
}

function FormCombobox ({ items }) {
  const [query, setQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState(null)

  const filteredItems =
    query === ''
      ? items
      : items.filter((item) => {
        return item.name.toLowerCase().includes(query.toLowerCase())
      })

  return (
    <Combobox as="div" value={selectedPerson} onChange={setSelectedPerson}>
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          // @ts-ignore
          displayValue={(item) => item?.name}
          placeholder={`${items[0].name}`}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <div className="h-5 w-5 text-gray-400" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
          </div>
        </Combobox.Button>

        {filteredItems.length > 0 && (
          <Combobox.Options
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredItems.map((item) => (
              <Combobox.Option
                key={item.name}
                value={item}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-cyan-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({
                  active,
                  selected
                }) => (
                  <>
                    <span className={classNames('block truncate', selected && 'font-semibold')}>{item.name}</span>

                    {selected && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-cyan-600'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  )
}

const steps = [
  {
    id: 0,
    name: 'First step',
    title: 'Create new reward plan',
    description: 'Tacit offers templates for the most impactful reward systems.'
  },
  {
    id: 1,
    name: 'Second step',
    title: 'Second step title',
    description: 'Second step description'
  },
  {
    id: 2,
    name: 'Done step',
    title: 'Done',
    description: 'Your reward program is ready to go'
  }
]

const DashboardModal = ({
  open,
  setOpen,
  step,
  setStep
}) => {
  const cancelButtonRef = useRef(null)
  const nextStep = () => {
    const nextStep = find(steps, ['id', step.id + 1])
    if (nextStep) {
      setStep(nextStep)
    } else {
      setOpen(false)
    }
  }

  const renderSidebarForStep = () => {
    return <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        {step.title}
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        {step.description}
      </p>
    </>
  }

  const getButtonTextForStep = () => {
    switch (step.id) {
      case 0:
        return 'Continue'
      case 1:
        return 'Create Reward program'
      case 2:
      default:
        return 'Done'
    }
  }

  const renderContentForStep = () => {
    switch (step.id) {
      case 0:
        return <form action="#" method="POST">
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 sm:col-span-2">
                  <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
                    Choose your type of reward plan
                  </label>
                  <FormCombobox
                    items={[{ name: 'Referral' }, { name: 'Loyalty Program' }, { name: 'Quest' }]} />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    placeholder="Reward Run 1 - 2023"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                                <textarea
                                  id="description"
                                  name="description"
                                  rows={3}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                                  placeholder="..."
                                  defaultValue={''}
                                />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Brief description, this will not be publicly visible.
                  </p>
                </div>
              </div>

              {/* <div> */}
              {/*   <label className="block text-sm font-medium text-gray-700">Cover photo</label> */}
              {/*   <div */}
              {/*     className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6"> */}
              {/*     <div className="space-y-1 text-center"> */}
              {/*       <svg */}
              {/*         className="mx-auto h-12 w-12 text-gray-400" */}
              {/*         stroke="currentColor" */}
              {/*         fill="none" */}
              {/*         viewBox="0 0 48 48" */}
              {/*         aria-hidden="true" */}
              {/*       > */}
              {/*         <path */}
              {/*           d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" */}
              {/*           strokeWidth={2} */}
              {/*           strokeLinecap="round" */}
              {/*           strokeLinejoin="round" */}
              {/*         /> */}
              {/*       </svg> */}
              {/*       <div className="flex text-sm text-gray-600"> */}
              {/*         <label */}
              {/*           htmlFor="file-upload" */}
              {/*           className="relative cursor-pointer rounded-md bg-white font-medium text-cyan-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 hover:text-cyan-500" */}
              {/*         > */}
              {/*           <span>Upload a file</span> */}
              {/*           <input id="file-upload" name="file-upload" type="file" className="sr-only" /> */}
              {/*         </label> */}
              {/*         <p className="pl-1">or drag and drop</p> */}
              {/*       </div> */}
              {/*       <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p> */}
              {/*     </div> */}
              {/*   </div> */}
              {/* </div> */}
            </div>
            {/* <div className="bg-gray-50 px-4 py-3 text-right sm:px-6"> */}
            {/*   <button */}
            {/*     type="submit" */}
            {/*     className="inline-flex justify-center rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2" */}
            {/*   > */}
            {/*     Save */}
            {/*   </button> */}
            {/* </div> */}
          </div>
        </form>
      case 1:
        return <form action="#" method="POST">
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 sm:col-span-2">
                  <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
                    How do you want to reward users?
                  </label>
                  {/* <div className="mt-1 flex rounded-md shadow-sm"> */}
                  {/* <span */}
                  {/*   className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500"> */}
                  {/*   http:// */}
                  {/* </span> */}
                  {/* <input */}
                  {/*   type="text" */}
                  {/*   name="company-website" */}
                  {/*   id="company-website" */}
                  {/*   className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" */}
                  {/*   placeholder="www.example.com" */}
                  {/* /> */}
                  {/* </div> */}
                  <div className="grid grid-cols-4 gap-1">
                    <div className="col-span-3">
                      <FormCombobox
                        items={[{ name: 'Governance Token' }, { name: 'Loyalty NFT Season 1' }, { name: 'POAP Token' }, { name: 'Experience Points' }]} />
                    </div>
                    <div className="col-span-1 mt-1 flex items-center">
                      <button
                        type="button"
                        className="flex ml-5 rounded-md border border-gray-300 bg-white py-2.5 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                      >
                        <PlusCircleIcon className="mr-1 h-4 w-4" aria-hidden="true" />Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rewards cover photo</label>
                <div
                  className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-cyan-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 hover:text-cyan-500"
                      >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="bg-gray-50 px-4 py-3 text-right sm:px-6"> */}
            {/*   <button */}
            {/*     type="submit" */}
            {/*     className="inline-flex justify-center rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2" */}
            {/*   > */}
            {/*     Save */}
            {/*   </button> */}
            {/* </div> */}
          </div>
        </form>
      case 2:
        return <div className="relative bg-gray-800">
          <div className="h-56 bg-indigo-600">
            <img
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=max&w=1920&q=60&blend=FFABAB&sat=-10&blend-mode=multiply"
              alt=""
            />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-8">
            <div className="">
              <p className="mt-2 text-3xl font-bold tracking-tight text-white">Your reward program is ready 🎉</p>
              <p className="mt-3 text-lg text-gray-300">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et, egestas tempus tellus etiam sed. Quam a
                scelerisque amet ullamcorper eu enim et fermentum, augue. Aliquet amet volutpat quisque ut interdum
                tincidunt duis.
              </p>
              <div className="mt-8">
                <div className="inline-flex rounded-md shadow">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Visit your dashboard
                    <ArrowTopRightOnSquareIcon className="-mr-1 ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
    }
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div>
                  <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                      <div className="px-4 sm:px-0">
                        {renderSidebarForStep()}
                      </div>
                    </div>
                    <div className="mt-5 md:col-span-2 md:mt-0">
                      {renderContentForStep()}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    onClick={() => setStep(steps[0])}
                    type="submit"
                    className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-gray-200 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-300 focus:outline-none"
                  >
                    Reset
                  </button>
                  <button
                    onClick={nextStep}
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-secondary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-secondary-light focus:outline-none"
                  >
                    {getButtonTextForStep()}
                  </button>
                </div>
                {/* <div className="hidden sm:block" aria-hidden="true"> */}
                {/*   <div className="py-5"> */}
                {/*     <div className="border-t border-gray-200" /> */}
                {/*   </div> */}
                {/* </div> */}

                {/* <div className="mt-10 sm:mt-0"> */}
                {/*   <div className="md:grid md:grid-cols-3 md:gap-6"> */}
                {/*     <div className="md:col-span-1"> */}
                {/*       <div className="px-4 sm:px-0"> */}
                {/*         <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3> */}
                {/*         <p className="mt-1 text-sm text-gray-600">Use a permanent address where you can receive */}
                {/*           mail.</p> */}
                {/*       </div> */}
                {/*     </div> */}
                {/*     <div className="mt-5 md:col-span-2 md:mt-0"> */}
                {/*       <form action="#" method="POST"> */}
                {/*         <div className="overflow-hidden shadow sm:rounded-md"> */}
                {/*           <div className="bg-white px-4 py-5 sm:p-6"> */}
                {/*             <div className="grid grid-cols-6 gap-6"> */}
                {/*               <div className="col-span-6 sm:col-span-3"> */}
                {/*                 <label htmlFor="first-name" className="block text-sm font-medium text-gray-700"> */}
                {/*                   First name */}
                {/*                 </label> */}
                {/*                 <input */}
                {/*                   type="text" */}
                {/*                   name="first-name" */}
                {/*                   id="first-name" */}
                {/*                   autoComplete="given-name" */}
                {/*                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" */}
                {/*                 /> */}
                {/*               </div> */}

                {/*               <div className="col-span-6 sm:col-span-3"> */}
                {/*                 <label htmlFor="last-name" className="block text-sm font-medium text-gray-700"> */}
                {/*                   Last name */}
                {/*                 </label> */}
                {/*                 <input */}
                {/*                   type="text" */}
                {/*                   name="last-name" */}
                {/*                   id="last-name" */}
                {/*                   autoComplete="family-name" */}
                {/*                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" */}
                {/*                 /> */}
                {/*               </div> */}

                {/*               <div className="col-span-6 sm:col-span-4"> */}
                {/*                 <label htmlFor="email-address" className="block text-sm font-medium text-gray-700"> */}
                {/*                   Email address */}
                {/*                 </label> */}
                {/*                 <input */}
                {/*                   type="text" */}
                {/*                   name="email-address" */}
                {/*                   id="email-address" */}
                {/*                   autoComplete="email" */}
                {/*                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" */}
                {/*                 /> */}
                {/*               </div> */}

                {/*               <div className="col-span-6 sm:col-span-3"> */}
                {/*                 <label htmlFor="country" className="block text-sm font-medium text-gray-700"> */}
                {/*                   Country */}
                {/*                 </label> */}
                {/*                 <select */}
                {/*                   id="country" */}
                {/*                   name="country" */}
                {/*                   autoComplete="country-name" */}
                {/*                   className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm" */}
                {/*                 > */}
                {/*                   <option>United States</option> */}
                {/*                   <option>Canada</option> */}
                {/*                   <option>Mexico</option> */}
                {/*                 </select> */}
                {/*               </div> */}

                {/*               <div className="col-span-6"> */}
                {/*                 <label htmlFor="street-address" className="block text-sm font-medium text-gray-700"> */}
                {/*                   Street address */}
                {/*                 </label> */}
                {/*                 <input */}
                {/*                   type="text" */}
                {/*                   name="street-address" */}
                {/*                   id="street-address" */}
                {/*                   autoComplete="street-address" */}
                {/*                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" */}
                {/*                 /> */}
                {/*               </div> */}

                {/*               <div className="col-span-6 sm:col-span-6 lg:col-span-2"> */}
                {/*                 <label htmlFor="city" className="block text-sm font-medium text-gray-700"> */}
                {/*                   City */}
                {/*                 </label> */}
                {/*                 <input */}
                {/*                   type="text" */}
                {/*                   name="city" */}
                {/*                   id="city" */}
                {/*                   autoComplete="address-level2" */}
                {/*                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" */}
                {/*                 /> */}
                {/*               </div> */}

                {/*               <div className="col-span-6 sm:col-span-3 lg:col-span-2"> */}
                {/*                 <label htmlFor="region" className="block text-sm font-medium text-gray-700"> */}
                {/*                   State / Province */}
                {/*                 </label> */}
                {/*                 <input */}
                {/*                   type="text" */}
                {/*                   name="region" */}
                {/*                   id="region" */}
                {/*                   autoComplete="address-level1" */}
                {/*                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" */}
                {/*                 /> */}
                {/*               </div> */}

                {/*               <div className="col-span-6 sm:col-span-3 lg:col-span-2"> */}
                {/*                 <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700"> */}
                {/*                   ZIP / Postal code */}
                {/*                 </label> */}
                {/*                 <input */}
                {/*                   type="text" */}
                {/*                   name="postal-code" */}
                {/*                   id="postal-code" */}
                {/*                   autoComplete="postal-code" */}
                {/*                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" */}
                {/*                 /> */}
                {/*               </div> */}
                {/*             </div> */}
                {/*           </div> */}
                {/*           <div className="bg-gray-50 px-4 py-3 text-right sm:px-6"> */}
                {/*             <button */}
                {/*               type="submit" */}
                {/*               className="inline-flex justify-center rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2" */}
                {/*             > */}
                {/*               Save */}
                {/*             </button> */}
                {/*           </div> */}
                {/*         </div> */}
                {/*       </form> */}
                {/*     </div> */}
                {/*   </div> */}
                {/* </div> */}

                {/* <div className="hidden sm:block" aria-hidden="true"> */}
                {/*   <div className="py-5"> */}
                {/*     <div className="border-t border-gray-200" /> */}
                {/*   </div> */}
                {/* </div> */}

                {/* <div className="mt-10 sm:mt-0"> */}
                {/*   <div className="md:grid md:grid-cols-3 md:gap-6"> */}
                {/*     <div className="md:col-span-1"> */}
                {/*       <div className="px-4 sm:px-0"> */}
                {/*         <h3 className="text-lg font-medium leading-6 text-gray-900">Email Notifications</h3> */}
                {/*         <p className="mt-1 text-sm text-gray-600">Decide which communications you'd like to receive and */}
                {/*           how.</p> */}
                {/*       </div> */}
                {/*     </div> */}
                {/*     <div className="mt-5 md:col-span-2 md:mt-0"> */}
                {/*       <form action="#" method="POST"> */}
                {/*         <div className="overflow-hidden shadow sm:rounded-md"> */}
                {/*           <div className="space-y-6 bg-white px-4 py-5 sm:p-6"> */}
                {/*             <fieldset> */}
                {/*               <div className="mt-4 space-y-4"> */}
                {/*                 <div className="flex items-start"> */}
                {/*                   <div className="flex h-5 items-center"> */}
                {/*                     <input */}
                {/*                       id="comments" */}
                {/*                       name="comments" */}
                {/*                       type="checkbox" */}
                {/*                       className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" */}
                {/*                     /> */}
                {/*                   </div> */}
                {/*                   <div className="ml-3 text-sm"> */}
                {/*                     <label htmlFor="comments" className="font-medium text-gray-700"> */}
                {/*                       New users */}
                {/*                     </label> */}
                {/*                     <p className="text-gray-500">Get notified when a new user joins a reward */}
                {/*                       journey.</p> */}
                {/*                   </div> */}
                {/*                 </div> */}
                {/*                 <div className="flex items-start"> */}
                {/*                   <div className="flex h-5 items-center"> */}
                {/*                     <input */}
                {/*                       id="candidates" */}
                {/*                       name="candidates" */}
                {/*                       type="checkbox" */}
                {/*                       className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" */}
                {/*                     /> */}
                {/*                   </div> */}
                {/*                   <div className="ml-3 text-sm"> */}
                {/*                     <label htmlFor="candidates" className="font-medium text-gray-700"> */}
                {/*                       Rewards */}
                {/*                     </label> */}
                {/*                     <p className="text-gray-500">Get notified when a user achieves a new reward.</p> */}
                {/*                   </div> */}
                {/*                 </div> */}
                {/*                 <div className="flex items-start"> */}
                {/*                   <div className="flex h-5 items-center"> */}
                {/*                     <input */}
                {/*                       id="offers" */}
                {/*                       name="offers" */}
                {/*                       type="checkbox" */}
                {/*                       className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" */}
                {/*                     /> */}
                {/*                   </div> */}
                {/*                   <div className="ml-3 text-sm"> */}
                {/*                     <label htmlFor="offers" className="font-medium text-gray-700"> */}
                {/*                       Referral */}
                {/*                     </label> */}
                {/*                     <p className="text-gray-500">Get notified when a referral journey was */}
                {/*                       successful.</p> */}
                {/*                   </div> */}
                {/*                 </div> */}
                {/*               </div> */}
                {/*             </fieldset> */}
                {/*           </div> */}
                {/*           <div className="bg-gray-50 px-4 py-3 text-right sm:px-6"> */}
                {/*             <button */}
                {/*               type="submit" */}
                {/*               className="inline-flex justify-center rounded-md border border-transparent bg-cyan-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2" */}
                {/*             > */}
                {/*               Save */}
                {/*             </button> */}
                {/*           </div> */}
                {/*         </div> */}
                {/*       </form> */}
                {/*     </div> */}
                {/*   </div> */}
                {/* </div> */}
                {/* <div> */}
                {/*   <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"> */}
                {/*     <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" /> */}
                {/*   </div> */}
                {/*   <div className="mt-3 text-center sm:mt-5"> */}
                {/*     <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900"> */}
                {/*       Payment successful */}
                {/*     </Dialog.Title> */}
                {/*     <div className="mt-2"> */}
                {/*       <p className="text-sm text-gray-500"> */}
                {/*         Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius aliquam laudantium explicabo */}
                {/*         pariatur iste dolorem animi vitae error totam. At sapiente aliquam accusamus facere veritatis. */}
                {/*       </p> */}
                {/*     </div> */}
                {/*   </div> */}
                {/* </div> */}
                {/* <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3"> */}
                {/*   <button */}
                {/*     type="button" */}
                {/*     className="inline-flex w-full justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm" */}
                {/*     onClick={() => setOpen(false)} */}
                {/*   > */}
                {/*     Deactivate */}
                {/*   </button> */}
                {/*   <button */}
                {/*     type="button" */}
                {/*     className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm" */}
                {/*     onClick={() => setOpen(false)} */}
                {/*     ref={cancelButtonRef} */}
                {/*   > */}
                {/*     Cancel */}
                {/*   </button> */}
                {/* </div> */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default function Dashboard () {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [step, setStep] = useState(steps[0])

  return (
    <>
      <Head>
        <title>Rewards Dashboard - Tacit</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:site_name" content="Tacit" />
        <meta property="og:type" content="website" />
      </Head>
      <DashboardModal step={step} setStep={setStep} open={modalOpen} setOpen={setModalOpen} />
      <div className="min-h-full">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-cyan-700 pt-5 pb-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex flex-shrink-0 items-center px-4">
                    <img
                      className="h-8 w-auto"
                      src="./tacit_t.png"
                      alt="Tacit logo"
                    />
                  </div>
                  <nav
                    className="mt-5 h-full flex-shrink-0 divide-y divide-cyan-800 overflow-y-auto"
                    aria-label="Sidebar"
                  >
                    <div className="space-y-1 px-2">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-cyan-800 text-white'
                              : 'text-cyan-100 hover:text-white hover:bg-cyan-600',
                            'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                          )}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          <item.icon className="mr-4 h-6 w-6 flex-shrink-0 text-cyan-200" aria-hidden="true" />
                          {item.name}
                        </a>
                      ))}
                    </div>
                    <div className="mt-6 pt-6">
                      <div className="space-y-1 px-2">
                        {secondaryNavigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="group flex items-center rounded-md px-2 py-2 text-base font-medium text-cyan-100 hover:bg-cyan-600 hover:text-white"
                          >
                            <item.icon className="mr-4 h-6 w-6 text-cyan-200" aria-hidden="true" />
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </nav>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex flex-grow flex-col overflow-y-auto bg-secondary pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <img
                className="h-8 w-auto"
                src="./tacit_t.png"
                alt="Tacit logo"
              />
            </div>
            <nav className="mt-5 flex flex-1 flex-col divide-y divide-cyan-800 overflow-y-auto" aria-label="Sidebar">
              <div className="space-y-1 px-2">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current ? 'bg-primary-light text-white' : 'text-cyan-100 hover:text-white hover:bg-secondary-light',
                      'group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    <item.icon className="mr-4 h-6 w-6 flex-shrink-0 text-gray-200" aria-hidden="true" />
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="mt-6 pt-6">
                <div className="space-y-1 px-2">
                  {secondaryNavigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="group flex items-center rounded-md px-2 py-2 text-sm font-medium leading-6 text-cyan-100 hover:bg-secondary-light hover:text-white"
                    >
                      <item.icon className="mr-4 h-6 w-6 text-cyan-200" aria-hidden="true" />
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:pl-64">
          <div className="flex h-16 flex-shrink-0 border-b border-gray-200 bg-white lg:border-none">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3CenterLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            {/* Search bar */}
            <div className="flex flex-1 justify-between px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8">
              <div className="flex flex-1">
                <form className="flex w-full md:ml-0" action="#" method="GET">
                  <label htmlFor="search-field" className="sr-only">
                    Search
                  </label>
                  <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                      <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <input
                      id="search-field"
                      name="search-field"
                      className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                      placeholder="Search rewards"
                      type="search"
                    />
                  </div>
                </form>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button
                      className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 lg:rounded-md lg:p-2 lg:hover:bg-gray-50">
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1633421878789-30435a5f7ea8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        // src="./dtravel.png"
                        alt=""
                      />
                      <span className="ml-3 hidden text-sm font-medium text-gray-700 lg:block">
                        <span className="sr-only">Open user menu for </span>Cynthia
                      </span>
                      <ChevronDownIcon
                        className="ml-1 hidden h-5 w-5 flex-shrink-0 text-gray-400 lg:block"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items
                      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                          >
                            Your Profile
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                          >
                            Settings
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                          >
                            Logout
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
          <main className="flex-1 pb-8">
            {/* Page header */}
            <div className="bg-white shadow">
              <div className="px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8">
                <div className="py-6 md:flex md:items-center md:justify-between lg:border-t lg:border-gray-200">
                  <div className="min-w-0 flex-1">
                    {/* Profile */}
                    <div className="flex items-center">
                      <img
                        className="hidden h-16 w-16 rounded-full sm:block"
                        // src="https://images.unsplash.com/photo-1633421878789-30435a5f7ea8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80"
                        src="./dtravel.png"
                        alt=""
                      />
                      <div>
                        <div className="flex items-center">
                          <img
                            className="h-16 w-16 rounded-full sm:hidden"
                            src="https://images.unsplash.com/photo-1633421878789-30435a5f7ea8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80"
                            alt=""
                          />
                          <h1 className="ml-3 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:leading-9">
                            Welcome to Tacit 👋🏼
                          </h1>
                        </div>
                        <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
                          <dt className="sr-only">Company</dt>
                          <dd className="flex items-center text-sm font-medium capitalize text-gray-500 sm:mr-6">
                            <BuildingOfficeIcon
                              className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                              aria-hidden="true"
                            />
                            Dtravel
                          </dd>
                          <dt className="sr-only">Account status</dt>
                          <dd
                            className="mt-3 flex items-center text-sm font-medium capitalize text-gray-500 sm:mr-6 sm:mt-0">
                            <CheckCircleIcon
                              className="mr-1.5 h-5 w-5 flex-shrink-0 text-green-400"
                              aria-hidden="true"
                            />
                            Verified account
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
                    <button
                      onClick={() => setModalOpen(true)}
                      type="button"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                    >
                      Add reward plan
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                    >
                      Payout rewards
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-lg font-medium leading-6 text-gray-900">Overview</h2>
                <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Card */}
                  {cards.map((card) => (
                    <div key={card.name} className="overflow-hidden rounded-lg bg-white shadow">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <card.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="truncate text-sm font-medium text-gray-500">{card.name}</dt>
                              <dd>
                                <div className="text-lg font-medium text-gray-900">{card.amount}</div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                          <a href={card.href} className="font-medium text-cyan-700 hover:text-cyan-900">
                            {card.cta || 'View all'}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="mx-auto mt-8 max-w-6xl px-4 text-lg font-medium leading-6 text-gray-900 sm:px-6 lg:px-8">
                Recent activity
              </h2>

              {/* Activity list (smallest breakpoint only) */}
              <div className="shadow sm:hidden">
                <ul role="list" className="mt-2 divide-y divide-gray-200 overflow-hidden shadow sm:hidden">
                  {transactions.map((transaction) => (
                    <li key={transaction.id}>
                      <a href={transaction.href} className="block bg-white px-4 py-4 hover:bg-gray-50">
                        <span className="flex items-center space-x-4">
                          <span className="flex flex-1 space-x-2 truncate">
                            <BanknotesIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            <span className="flex flex-col truncate text-sm text-gray-500">
                              <span className="truncate">{transaction.name}</span>
                              <span>
                                <span className="font-medium text-gray-900">{transaction.currency}</span>{' '}
                                {transaction.amount}
                              </span>
                              <time dateTime={transaction.datetime}>{transaction.date}</time>
                            </span>
                          </span>
                          <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>

                <nav
                  className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3"
                  aria-label="Pagination"
                >
                  <div className="flex flex-1 justify-between">
                    <a
                      href="#"
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                    >
                      Previous
                    </a>
                    <a
                      href="#"
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                    >
                      Next
                    </a>
                  </div>
                </nav>
              </div>

              {/* Activity table (small breakpoint and up) */}
              <div className="hidden sm:block">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                  <div className="mt-2 flex flex-col">
                    <div className="min-w-full overflow-hidden overflow-x-auto align-middle shadow sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                        <tr>
                          <th
                            className="bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-900"
                            scope="col"
                          >
                            Transaction
                          </th>
                          <th
                            className="bg-gray-50 px-6 py-3 text-right text-sm font-semibold text-gray-900"
                            scope="col"
                          >
                            Amount
                          </th>
                          <th
                            className="hidden bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-900 md:block"
                            scope="col"
                          >
                            Status
                          </th>
                          <th
                            className="bg-gray-50 px-6 py-3 text-right text-sm font-semibold text-gray-900"
                            scope="col"
                          >
                            Date
                          </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="bg-white">
                            <td className="w-full max-w-0 whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              <div className="flex">
                                <a href={transaction.href} className="group inline-flex space-x-2 truncate text-sm">
                                  <BanknotesIcon
                                    className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                    aria-hidden="true"
                                  />
                                  <p className="truncate text-gray-500 group-hover:text-gray-900">
                                    {transaction.name}
                                  </p>
                                </a>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                              <span className="font-medium text-gray-900">{transaction.currency}{' '}</span>
                              {transaction.amount}
                            </td>
                            <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 md:block">
                                <span
                                  className={classNames(
                                    statusStyles[transaction.status],
                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize'
                                  )}
                                >
                                  {transaction.status}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                              <time dateTime={transaction.datetime}>{transaction.date}</time>
                            </td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                      {/* Pagination */}
                      <nav
                        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
                        aria-label="Pagination"
                      >
                        <div className="hidden sm:block">
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">1</span> to <span
                            className="font-medium">10</span> of{' '}
                            <span className="font-medium">20</span> results
                          </p>
                        </div>
                        <div className="flex flex-1 justify-between sm:justify-end">
                          <a
                            href="#"
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Previous
                          </a>
                          <a
                            href="#"
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Next
                          </a>
                        </div>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
