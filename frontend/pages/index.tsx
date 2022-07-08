import { useCallback, useContext, useEffect, useState } from 'react'
import { ArrowSmDownIcon, CheckCircleIcon } from '@heroicons/react/solid'
import { loadWeb3Modal } from '../src/walletUtils'
import Web3NavBar from '../src/components/Web3NavBar'
import { AppContext } from '../src/context'
import CreateTaskComponent from '../src/components/CreateTaskComponent'
import { get } from 'lodash'
// eslint-disable-next-line node/no-missing-import
import { CreateTaskState } from '../src/const'
import PresentActionLinksComponent from '../src/components/PresentActionLinksComponent'
import dynamic from 'next/dynamic'

// eslint-disable-next-line node/no-unsupported-features/es-syntax
const HowToExplainerComponent = dynamic(() => import('../src/components/HowToExplainerComponent'))
// eslint-disable-next-line node/no-unsupported-features/es-syntax
const LoomExplainerVideoComponent = dynamic(() => import('../src/components/LoomExplainerVideoComponent'))

const exampleSuccessStateData = {
  transactionHash: '0xd852a40d8bd87f34315f7fc0280a31df974bf0089fed2c8f49df38759a43f755',
  taskPath: '0xd57faf7a3206b1ba5e791ec7a2dc5a2ab5bfbdd6ee81a1bb4fd5c5c6b6ed4768',
  sharePath: '0xb698c3b07d39d2d9ea1867f042ab8c62f1ddbcda185e55cee33cdd041d84dd46'

}

interface TaskSubmissionStateType {
  name: CreateTaskState;
  data?: object;
}

export default function Home () {
  const [, dispatch] = useContext(AppContext)
  const [taskSubmissionState, setTaskSubmissionState] = useState<TaskSubmissionStateType>({ name: CreateTaskState.Default })
  const [didScroll, setDidScroll] = useState(false)

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

  const onScroll = useCallback(event => {
    setDidScroll(true)
    window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    // remove event on unmount to prevent a memory leak
  }, [])

  console.log(didScroll)
  const renderTaskComponent = () => {
    return (<div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
        <div className="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-sm sm:overflow-hidden">
          {getTaskComponentDependingOnState()}
        </div>
      </div>
    )
  }

  function getTaskComponentDependingOnState () {
    const stateName = get(taskSubmissionState, 'name')
    switch (stateName) {
      case CreateTaskState.Default:
      case CreateTaskState.PendingUserInputBounty:
        return <CreateTaskComponent state={taskSubmissionState} setState={setTaskSubmissionState} />
      case CreateTaskState.PendingUploadToIpfs:
        return <div className="px-4 py-8 sm:px-10">
          <div className="mt-0">
            {renderStepIndicator(1)}
          </div>
        </div>
      case CreateTaskState.PendingUserApproval:
        return <div className="px-4 py-8 sm:px-10">
          <div className="mt-0">
            {renderStepIndicator(2)}
          </div>
        </div>
      case CreateTaskState.PendingContractTransaction:
        return <div className="px-4 py-8 sm:px-10">
          <div className="mt-0">
            {renderStepIndicator(3)}
          </div>
        </div>
      case CreateTaskState.DoneCreatingTask:
        return <>
          <div className="px-4 py-8 sm:px-10">
            <PresentActionLinksComponent data={taskSubmissionState.data} />
          </div>
          <div className="px-4 py-6 bg-gray-50 border-t-2 border-gray-200 sm:px-10">
            <p className="text-xs leading-5 text-gray-500">
              Thank you for being early (🤩, 🤩)
            </p>
          </div>
        </>
      default:
        return <div className="px-4 py-8 sm:px-10">
          <div className="mt-0">
            Error - you should not see this 😅👋🏼
            <div className="mt-5 sm:mt-2 sm:flex-shrink-0 sm:flex sm:items-center">
              <button
                onClick={() => setTaskSubmissionState({ name: CreateTaskState.Default })}
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-sm text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
              >
                Start over
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-100 p-2 px-4 mt-4 rounded-sm">
                error (shows only in dev-mode)<br />
                {JSON.stringify(get(taskSubmissionState, 'error'))}
              </div>)
            }
          </div>
        </div>
    }
  }

  const renderStepIndicator = (currStepId) => {
    const steps = [
      {
        name: 'Step 1 - Submit task details',
        href: '#',
        status: 'complete'
      },
      {
        name: 'Step 2 - Upload public data to IPFS',
        href: '#',
        status: 'current'
      },
      {
        name: 'Step 3 - Approve transaction(s)',
        href: '#',
        status: 'upcoming'
      },
      {
        name: 'Step 4 - Wait for on-chain transaction',
        href: '#',
        status: 'upcoming'
      }
    ]
    return <div className="py-12 px-4 sm:px-6 lg:px-8">
      <nav className="flex justify-center" aria-label="Progress">
        <ol role="list" className="space-y-6">
          {steps.map((step, idx) => (
            <li key={step.name}>
              {idx < currStepId ? (
                <div className="group">
                  <span className="flex items-start">
                    <span className="flex-shrink-0 relative h-5 w-5 flex items-center justify-center">
                      <CheckCircleIcon
                        className="h-full w-full text-indigo-600 group-hover:text-indigo-800"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                      {step.name}
                    </span>
                  </span>
                </div>
              ) : idx === currStepId ? (
                <div className="flex items-start" aria-current="step">
                  <span className="flex-shrink-0 h-5 w-5 relative flex items-center justify-center" aria-hidden="true">
                    <span className="absolute h-4 w-4 rounded-full bg-indigo-200" />
                    <span className="relative block w-2 h-2 bg-indigo-600 rounded-full" />
                  </span>
                  <span className="ml-3 text-sm font-medium text-indigo-600">{step.name}</span>
                </div>
              ) : (
                <div className="group">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 relative flex items-center justify-center" aria-hidden="true">
                      <div className="h-2 w-2 bg-gray-300 rounded-full group-hover:bg-gray-400" />
                    </div>
                    <p className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">{step.name}</p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
    // <nav className="flex items-center justify-center" aria-label="Progress">
    //   <p className="text-sm font-medium">
    //     Step {currStepId + 1} of {steps.length}
    //   </p>
    //   <ol role="list" className="ml-8 flex items-center space-x-5">
    //     {steps.map((step, idx) => (
    //       <li key={step.name}>
    //         {idx < currStepId ? (
    //           <div className="block w-2.5 h-2.5 bg-indigo-600 rounded-full hover:bg-indigo-900">
    //             <span className="sr-only">{step.name}</span>
    //           </div>
    //         ) : idx === currStepId ? (
    //           <div className="relative flex items-center justify-center" aria-current="step">
    //             <span className="absolute w-5 h-5 p-px flex" aria-hidden="true">
    //               <span className="w-full h-full rounded-full bg-indigo-200" />
    //             </span>
    //             <span className="relative block w-2.5 h-2.5 bg-indigo-600 rounded-full" aria-hidden="true" />
    //             <span className="sr-only">{step.name}</span>
    //           </div>
    //         ) : (
    //           <div className="block w-2.5 h-2.5 bg-gray-200 rounded-full hover:bg-gray-400">
    //             <span className="sr-only">{step.name}</span>
    //           </div>
    //         )}
    //       </li>
    //     ))}
    //   </ol>
    // </nav>
  }

  // @ts-ignore
  return (
    <div className="relative bg-background overflow-hidden min-h-screen">
      {/* <div className="relative bg-gradient-to-tr from-red-500 via-gray-700 to-gray-800 overflow-hidden min-h-screen"> */}
      <div className="relative pt-6 pb-16">
        <Web3NavBar />
        <main className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div
                className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex">
                <div className="grid grid-rows-4">
                  <div className="row-span-3">
                    <div
                      className="inline-flex items-center text-gray-800 bg-gray-200 rounded-full p-1 pr-2 sm:text-base lg:text-sm xl:text-base">
                    <span
                      className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-secondary rounded-full">
                      WAGMI
                    </span>
                      <span className="mx-2 text-sm">
                      Find what you are looking for
                    </span>
                    </div>
                    <h1
                      className="mt-4 text-4xl tracking-tight font-extrabold text-light sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                      <span className="md:block">On-chain referrals</span>{' '}
                      <span className="text-primary md:block">
                      for Web3 communities
                    </span>
                    </h1>
                    <p className="mt-3 text-base text-light sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                      Create a search task, attach a token reward, and share it with your friends, who can share it
                      again
                      with their friends… ∞ Receive results and reward the contributors. Everyone who contributes to
                      finding what you are looking for gets a share of the reward.
                    </p>
                  </div>
                  <a
                    href="#how-to"
                    className="hidden lg:mt-4 lg:row-span-1 lg:flex 2xl:hidden">
                    <ArrowSmDownIcon
                      className="rounded-full w-6 h-6 text-gray-200 animate-bounce" />
                    <span className="ml-4 text-gray-200 shadow">Learn more</span>
                  </a>
                  {/* <p className="mt-8 text-sm text-white uppercase tracking-wide font-semibold sm:mt-10"> */}
                  {/*   Used by */}
                  {/* </p> */}
                  {/* <div className="mt-5 w-full sm:mx-auto sm:max-w-lg lg:ml-0"> */}
                  {/*   <div className="flex flex-wrap items-start justify-between"> */}
                  {/*     <div className="flex justify-center px-1"> */}
                  {/*       <Image */}
                  {/*         className="h-9 sm:h-10 invert" */}
                  {/*         src="/arweave.png" */}
                  {/*         alt="Arweave" */}
                  {/*         height="28" */}
                  {/*         width="130" */}
                  {/*       /> */}
                  {/*     </div> */}
                  {/*     <div className="flex justify-center px-1"> */}
                  {/*       <Image */}
                  {/*         className="h-9 sm:h-10" */}
                  {/*         src="/check24.png" */}
                  {/*         alt="Check24" */}
                  {/*         height="28" */}
                  {/*         width="130" */}
                  {/*       /> */}
                  {/*     </div> */}
                  {/*   </div> */}
                  {/* </div> */}
                </div>
              </div>
              {renderTaskComponent()}
            </div>
          </div>
          <div id="how-to">
            <div className="py-16 relative bg-white mx-auto px-4 sm:mt-24 sm:px-6">
              <div className="text-center flex justify-center">
                <div>
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">How to leverage Tacit</span>
                    <span className="block text-secondary">for your community</span>
                  </h1>
                  {didScroll && <LoomExplainerVideoComponent />}
                </div>
              </div>
            </div>
            <HowToExplainerComponent />
          </div>
        </main>
      </div>
    </div>
  )
}
