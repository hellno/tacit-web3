import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { TagIcon } from '@heroicons/react/20/solid'
import { classNames } from '../utils'
import { FormCombobox } from './FormCombobox'
import { PlusCircleIcon } from '@heroicons/react/24/outline'

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

const activities = [
  {
    id: 1,
    type: 'command',
    command: 'When',
    options: [{ name: 'Host finished first stay' }, { name: 'Host hosted 10 users' }, { name: 'User had first stay' }]
  },
  {
    id: 2,
    type: 'condition',
    condition: 'If',
    options: [{ name: 'Total days booked is more than' }, { name: 'Membership time is more than' }],
    optionsDetails: [{ name: 'day(s)' }, { name: 'week(s)' }]
  },
  {
    id: 3,
    type: 'operator',
    operator: 'and'
  },
  {
    id: 4,
    type: 'condition',
    condition: 'If',
    options: [{ name: 'Average rating was above' }, { name: 'Host hosted 10 users' }, { name: 'User had first stay' }],
    optionsDetails: [{ name: 'Stars ⭐️' }, { name: 'Successful Host Legendary NFT' }]
  },

  // {
  //   id: 3,
  //   type: 'tags',
  //   person: {
  //     name: 'Hilary Mahy',
  //     href: '#'
  //   },
  //   tags: [
  //     {
  //       name: 'Bug',
  //       href: '#',
  //       color: 'bg-rose-500'
  //     },
  //     {
  //       name: 'Accessibility',
  //       href: '#',
  //       color: 'bg-indigo-500'
  //     }
  //   ]
  // },
  {
    id: 5,
    type: 'action',
    action: 'add-rule'
  },
  {
    id: 6,
    type: 'output',
    options: [{ name: 'Send ERC20 Tokens' }, { name: 'Send NFT' }],
    optionsDetails: [{ name: 'Governance tokens' }, { name: 'Successful Host Legendary NFT' }],
    comment: 'Handing out governance tokens to active users distributes ownership and increases governance participation'
  },
  {
    id: 7,
    type: 'operator',
    operator: 'and'
  },
  {
    id: 8,
    type: 'output',
    options: [{ name: 'Send NFT' }, { name: 'Send ERC20 Tokens' }],
    optionsDetails: [{ name: 'Successful Host Legendary NFT' }, { name: 'Governance tokens' }]
  },
  {
    id: 9,
    type: 'action',
    action: 'Add another reward'
  }
]

export const RewardPlanManagerModal = ({
  open,
  setOpen
}) => {
  const [step, setStep] = useState(steps[0])

  const cancelButtonRef = useRef(null)
  const nextStep = () => {
    setOpen(false)
    // const nextStep = find(steps, ['id', step.id + 1])
    // if (nextStep) {
    //   setStep(nextStep)
    // } else {
    //   setOpen(false)
    // }
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
        return 'Save'
      case 1:
        return 'Create Reward program'
      case 2:
      default:
        return 'Done'
    }
  }

  const renderActivityElement = (activity) => {
    switch (activity.type) {
      case 'command':
        return <div className="flex flex-col">
          <div className="relative">
            <div className="flex rounded-md shadow-sm">
              <span
                className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                {activity.command}
              </span>
              <FormCombobox
                className="flex-1 mr-8 w-full rounded-none rounded-r-md border-gray-300 px-3 py-3 sm:text-sm"
                items={activity.options} />
            </div>
          </div>
          {/* <div className="ml-20 mt-2 min-w-0 flex-1"> */}
          {/*   <div> */}
          {/*     <div className="text-sm"> */}
          {/*       <a href="#" className="font-medium text-gray-900"> */}
          {/*         Person name goes here hello */}
          {/*       </a> */}
          {/*     </div> */}
          {/*   </div> */}
          {/*   <div className="mt-2 text-sm text-gray-700"> */}
          {/*     <p>{activity.comment}</p> */}
          {/*   </div> */}
          {/* </div> */}
        </div>
      case 'condition':
        return <div className="flex flex-col">
          <div className="relative">
            <div className="flex rounded-md shadow-sm">
              <span
                className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-6 text-gray-500 sm:text-sm">
                {activity.condition}
              </span>
              <FormCombobox
                className="flex-1 mr-16 w-full rounded-none rounded-r-md border-gray-300 px-3 py-3 sm:text-sm"
                items={activity.options} />
            </div>
          </div>
          <div className="ml-14 mt-2 min-w-full flex-1">
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="amount"
                id="amount"
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="3"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <label htmlFor="currency" className="sr-only">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {activity.optionsDetails.map(detail =>
                    <option>{detail.name}</option>
                  )}
                </select>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <p>{activity.comment}</p>
            </div>
          </div>
        </div>
      case 'output':
        return <div className="flex flex-col">
          <div className="relative">
            <div className="flex rounded-md shadow-sm">
              <span
                className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-4 text-gray-500 sm:text-sm">
                Then
              </span>
              <FormCombobox
                className="flex-1 mr-8 w-full rounded-none rounded-r-md border-gray-300 px-3 py-3 sm:text-sm"
                items={activity.options} />
            </div>
          </div>
          <div className="ml-14 mt-2 min-w-full flex-1">
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="amount"
                id="amount"
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="1"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <label htmlFor="currency" className="sr-only">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {activity.optionsDetails.map(detail =>
                    <option>{detail.name}</option>
                  )}
                </select>
              </div>
            </div>
            <div className="min-w-0 w-72 mt-2 text-sm text-gray-700">
              <p>{activity.comment}</p>
            </div>
          </div>
        </div>
      case 'operator':
        return <div className="-my-4 flex flex-col">
          <div className="relative">
            <div className="flex rounded-md shadow-sm">
              <span
                className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                {activity.operator}
              </span>
            </div>
          </div>
        </div>
      case 'tags':
        return <>
          <div>
            <div className="relative px-1">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                <TagIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 py-0">
            <div className="text-sm leading-8 text-gray-500">
                        <span className="mr-0.5">
                          <a href={activity.person.href} className="font-medium text-gray-900">
                            {activity.person.name}
                          </a>{' '}
                          added tags
                        </span>{' '}
              <span className="mr-0.5">
                  {activity.tags.map((tag) => (
                    <Fragment key={tag.name}>
                      <a
                        href={tag.href}
                        className="relative inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5 text-sm"
                      >
                        <span className="absolute flex flex-shrink-0 items-center justify-center">
                          <span
                            className={classNames(tag.color, 'h-1.5 w-1.5 rounded-full')}
                            aria-hidden="true"
                          />
                        </span>
                        <span className="ml-3.5 font-medium text-gray-900">{tag.name}</span>
                      </a>{' '}
                    </Fragment>
                  ))}
                </span>
              {/* <span className="whitespace-nowrap">{activity.date}</span> */}
            </div>
          </div>
        </>
      case 'action':
        return activity.action === 'add-rule'
          ? <div>
            <div className="relative px-1">
              <div
                className="flex items-center justify-center">
                <a
                  href="#"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 relative inline-flex items-center rounded-lg border border-gray-100 px-12 py-0.5 text-sm"
                >
                  <PlusCircleIcon className="-ml-1 mr-2 h-4 w-4"
                                  aria-hidden="true" />
                  <span className="my-0.5 font-medium">Add rule</span>
                </a>
              </div>
            </div>
          </div>
          : <div>
            <div className="relative px-1">
              <div
                className="flex items-center justify-center">
                <a
                  href="#"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 relative inline-flex items-center rounded-lg border border-gray-100 px-12 py-0.5 text-sm"
                >
                  <span className="my-0.5 font-medium">{activity.action}</span>
                </a>
              </div>
            </div>
          </div>
      default:
        return null
    }
  }

  const renderContentForStep = () => {
    switch (step.id) {
      case 0:
        return <div className="mb-8 flow-root">
          <ul role="list" className="-mb-8">
            {activities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1
                    ? (<span className="absolute top-5 left-8 -ml-px h-full w-0.5 bg-gray-300" aria-hidden="true" />)
                    : null}
                  <div className="relative flex items-start space-x-3">
                    {renderActivityElement(activity)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
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
