import { useContext, useEffect, useState } from 'react'
import { ChevronRightIcon } from '@heroicons/react/solid'
import { loadWeb3Modal } from '../src/walletUtils'
import Web3NavBar from '../src/components/Web3NavBar'
import { AppContext } from '../src/context'
import Image from 'next/image'
import CreateTaskComponent from '../src/components/CreateTaskComponent'
import { get } from 'lodash'
// eslint-disable-next-line node/no-missing-import
import { CreateTaskState } from '../src/const'
import ShareNewTaskComponent from '../src/components/ShareNewTaskComponent'

export default function Home () {
  const [, dispatch] = useContext(AppContext)
  const [taskSubmissionState, setTaskSubmissionState] = useState<CreateTaskState>(CreateTaskState.Default)

  useEffect(() => {
    if (window.ethereum) {
      // @ts-ignore
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
      // @ts-ignore
      window.ethereum.on('accountsChanged', () => {
        window.location.reload()
      })
    }
  })

  useEffect(() => {
    loadWeb3Modal(dispatch)
  }, [])

  // @ts-ignore
  return (
    <div className="relative bg-gradient-to-tr from-red-500 via-gray-700 to-gray-800 overflow-hidden min-h-screen">
      <div className="relative pt-6 pb-16 sm:pb-24">
        <Web3NavBar />
        <main className="mt-16 sm:mt-24">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div
                className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex">
                <div>
                  <a
                    href="#"
                    className="inline-flex items-center text-white bg-gray-900 rounded-full p-1 pr-2 sm:text-base lg:text-sm xl:text-base hover:text-gray-200"
                  >
                    <span
                      className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-yellow-500 rounded-full">
                      WAGMI
                    </span>
                    <span className="ml-4 text-sm">
                      Thank you for being here
                    </span>
                    <ChevronRightIcon
                      className="ml-2 w-5 h-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </a>
                  <h1
                    className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                    <span className="md:block">Crowd search tasks</span>{' '}
                    <span className="text-yellow-400 md:block">
                      for service DAOs
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure
                    qui lorem cupidatat commodo. Elit sunt amet fugiat veniam
                    occaecat fugiat aliqua ad ad non deserunt sunt.
                  </p>
                  <p className="mt-8 text-sm text-white uppercase tracking-wide font-semibold sm:mt-10">
                    Used by
                  </p>
                  <div className="mt-5 w-full sm:mx-auto sm:max-w-lg lg:ml-0">
                    <div className="flex flex-wrap items-start justify-between">
                      <div className="flex justify-center px-1">
                        <Image
                          className="h-9 sm:h-10"
                          src="/check24.png"
                          alt="Check24"
                          height="28"
                          width="130"
                        />
                      </div>
                      <div className="flex justify-center px-1">
                        <Image
                          className="h-9 sm:h-10 invert"
                          src="/arweave.png"
                          alt="Arweave"
                          height="28"
                          width="130"
                        />
                      </div>
                      <div className="flex justify-center px-1">
                        {/* <Image */}
                        {/*   className="h-9 sm:h-10" */}
                        {/*   src="https://tailwindui.com/img/logos/statickit-logo-gray-400.svg" */}
                        {/*   alt="StaticKit" */}
                        {/*   height="28" */}
                        {/*   width="28" */}
                        {/* /> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {get(taskSubmissionState, 'name') === CreateTaskState.DoneCreatingTask
                ? <ShareNewTaskComponent state={taskSubmissionState} />
                : <CreateTaskComponent state={taskSubmissionState} setState={setTaskSubmissionState} />
              }
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
