import { useCallback, useEffect, useState } from 'react'
import { ArrowDownIcon } from '@heroicons/react/20/solid'
import Web3NavBar from '../src/components/Web3NavBar'
import CreateTaskFormComponent from '../src/components/CreateTaskFormComponent'
import CreateTaskOnChainComponent from '../src/components/SubmitTaskOnChainComponent'
import { get } from 'lodash'
import { CreateTaskState } from '../src/const'
import dynamic from 'next/dynamic'
import { isProdEnv } from '../src/utils'

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

export default function Index () {
  const [taskSubmissionState, setTaskSubmissionState] = useState<TaskSubmissionStateType>({ name: CreateTaskState.PendingUserTaskInput })
  const [didScroll, setDidScroll] = useState(false)

  // useEffect(() => {
  //   if (window.ethereum) {
  //     // @ts-ignore
  //     window.ethereum.on('chainChanged', () => {
  //       window.location.reload()
  //     })
  //     // @ts-ignore
  //     window.ethereum.on('accountsChanged', () => {
  //       window.location.reload()
  //     })
  //   }
  // })

  // useEffect(() => {
  //   loadWeb3Modal(dispatch)
  // }, [])

  const onScroll = useCallback(event => {
    setDidScroll(true)
    window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    // remove event on unmount to prevent a memory leak
  }, [])

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
      case CreateTaskState.PendingUserTaskInput:
      case CreateTaskState.PendingUserBountyInput:
      case CreateTaskState.PendingUploadToIpfs:
        return <CreateTaskFormComponent state={taskSubmissionState} setState={setTaskSubmissionState} />
      case CreateTaskState.PendingERC20ContractApproval:
      case CreateTaskState.PendingUserOnChainApproval:
      case CreateTaskState.PendingUserApproval:
      case CreateTaskState.PendingTaskCreationTransactionApproval:
      case CreateTaskState.DoneCreatingTask:
        return <CreateTaskOnChainComponent state={taskSubmissionState} setState={setTaskSubmissionState} />
      default:
        return <div className="px-4 py-8 sm:px-10">
          <div className="mt-0">
            Error - you should not see this 🥲
            <div className="mt-5 sm:mt-2 sm:flex-shrink-0 sm:flex sm:items-center">
              <button
                onClick={() => setTaskSubmissionState({ name: CreateTaskState.PendingUserTaskInput })}
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-sm text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
              >
                Start over
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-100 p-2 px-4 mt-4 rounded-sm">
                error (only in dev-mode)<br />
                {get(taskSubmissionState, 'error', '')}
              </div>)
            }
          </div>
        </div>
    }
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
                      Welcome to Tacit 🤩
                    </span>
                    </div>
                    <h1
                      className="mt-4 text-4xl tracking-tight font-extrabold text-light sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                      <span className="md:block">On-chain tasks</span>{' '}
                      <span className="text-primary md:block">
                      for your DAO's orbit
                    </span>
                    </h1>
                    <p className="mt-3 text-base text-light sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                      DAOs are evolving towards small numbers of
                      highly skilled teams that form a core surrounded by a big number of contributors <b>in the
                      orbit</b>. Tacit helps you to engage and leverage the orbit.
                    </p>
                  </div>
                  <a
                    href="#how-to"
                    className="hidden lg:mt-4 lg:row-span-1 lg:flex 2xl:hidden">
                    <ArrowDownIcon
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
                  {didScroll && isProdEnv() && <LoomExplainerVideoComponent />}
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
