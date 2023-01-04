import { FormCombobox } from './FormCombobox'
import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { find } from 'lodash'
import { ArrowTopRightOnSquareIcon, PlusCircleIcon } from '@heroicons/react/24/outline'

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
export const CreateRewardPlanModal = ({
  open,
  setOpen
}) => {
  const [step, setStep] = useState(steps[0])

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
                  <label htmlFor="company-website" className="mb-1 block text-sm font-medium text-gray-700">
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
                    <div className="col-span-3 mt-1">
                      <FormCombobox
                        items={[{ name: 'Governance Token' }, { name: 'Loyalty NFT Season 1' }, { name: 'POAP Token' }, { name: 'Experience Points' }]} />
                    </div>
                    <div className="col-span-1 mt-1 flex items-center">
                      <button
                        type="button"
                        className="flex ml-5 rounded-md border border-gray-300 bg-white py-2.5 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
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
                        className="relative cursor-pointer rounded-md bg-white font-medium text-cyan-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 hover:text-secondary-500"
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
