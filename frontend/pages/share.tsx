import { useContext, useEffect, useState } from 'react'
import { CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { includes, isEmpty } from 'lodash'
import { useForm } from 'react-hook-form'
import { connectWallet, providerOptions, renderWalletConnectComponent } from '../src/walletUtils'
import { sleep } from '../src/utils'
import { AppContext } from '../src/context'
import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import rehypeFormat from 'rehype-format'
import remarkGfm from 'remark-gfm'
import ModalComponent from '../src/components/ModalComponent'
// eslint-disable-next-line node/no-missing-import
import { SharePageState, shareStates, solveStates } from '../src/const'
import { ClockIcon } from '@heroicons/react/outline'
import Web3Modal from 'web3modal'
import { renderWalletAddressInputField } from '../src/formUtils'
import Image from 'next/image'
import Web3NavBar from '../src/components/Web3NavBar'

const taskObject = {
  title: 'Looking for a MONOSPACE design agency 👀',
  // description: '**bold plain markdown** <html> <h1>big title test</h1>  <h3>what is this about</h3><p>a paragraph goes here</p><h3>another heading</h3>more text</html>',
  description: `A nice description of the task with *emphasis* and **strong importance**.

Text with ~strikethrough~ and a URL: https://please-solve-my-task.org.

Not showing this description 100% how I want to, but slowly getting there. 
`,
  bountyAmount: '1000',
  bountyContractAddress: '',
  owner: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
  createdAt: '2022-05-18'
}

export default function SharePage () {
  const router = useRouter()
  if (!isEmpty(router.query)) {
    const { id } = router.query
  }

  const [state, dispatch] = useContext(AppContext)
  const {
    account,
    library
  } = state
  const [web3Modal, setWeb3Modal] = useState()
  const [sharePageState, setSharePageState] = useState<SharePageState>(SharePageState.Default)

  const {
    register,
    handleSubmit
  } = useForm()

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
      window.ethereum.on('accountsChanged', () => {
        window.location.reload()
      })
    }
  })

  const isWalletConnected = !isEmpty(account)

  const onModalClose = () => {
    setSharePageState(SharePageState.Default)
  }

  const handleFormSubmit = (formData: {
    taskTitle: string
    description: string
    email: string
    bountyAmount: bigint
    bountyCurrency: string
  }) => {
  }

  const handleSolveFormSubmit = (formData) => {
    setSharePageState(SharePageState.PendingSolve)
    sleep(2500).then(() => setSharePageState(SharePageState.SuccessSubmitSolve))
  }

  const handleShareFormSubmit = (formData) => {
    setSharePageState(SharePageState.PendingShare)
    sleep(2500).then(() => setSharePageState(SharePageState.SuccessSubmitShare))
  }

  const renderActionButtonCard = () => {
    return (
      <div className="mx-auto py-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-100 sm:text-4xl">
          <span className="block">Ready to dive in?</span>
          {/* <span className="block text-yellow-600">Start your free trial today.</span> */}
        </h2>
        <div className="mt-4 flex">
          <div className="inline-flex rounded-md shadow">
            <button
              onClick={() => setSharePageState(SharePageState.ShareIntent)}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
            >
              Share task and earn referral
            </button>
          </div>
          <div className="ml-3 inline-flex">
            <button
              onClick={() => setSharePageState(SharePageState.SolveIntent)}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
            >
              Solve this
            </button>
          </div>
        </div>
      </div>)
  }

  useEffect(() => {
    const web3ModalTemp = new Web3Modal({
      // network: 'mainnet', // optional
      cacheProvider: true, // optional
      providerOptions // required
    })
    // @ts-ignore
    setWeb3Modal(web3ModalTemp)

    if (web3ModalTemp.cachedProvider) {
      connectWallet(web3ModalTemp, dispatch)
    }
  }, [])

  const renderShareModalContent = () => {
    switch (sharePageState) {
      case SharePageState.ShareIntent:
        return <div><p className="text-sm text-gray-500">
          I want to share this task with someone.
          Let me login with my wallet and generate a link.
        </p>
          <div className="mt-6 mr-8">
            <label
              htmlFor="walletAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Wallet Address
            </label>
            <div className="mt-1">
              {!isWalletConnected && renderWalletConnectComponent(account, web3Modal, dispatch)}
            </div>
            <form onSubmit={handleSubmit(handleShareFormSubmit)} className="space-y-6">
              <div>
                {isWalletConnected && renderWalletAddressInputField(account)}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={!isWalletConnected}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none"
                >
                  Create my share link
                </button>
              </div>
            </form>
          </div>
        </div>
      case SharePageState.PendingShare:
        return <div><p className="text-sm text-gray-500">
          Pending submission
        </p></div>
      case SharePageState.SuccessSubmitShare:
        return <div><p className="text-sm text-gray-500">
          Success. We need to show share url here.
        </p></div>
    }
  }

  const renderSolveModalContent = () => {
    switch (sharePageState) {
      case SharePageState.SolveIntent:
        return <div><p className="text-sm text-gray-500">
          I want to submit my solution here!
          Needs form with text description and submit button
        </p>
          <div className="mt-6 mr-8">
            <label
              htmlFor="walletAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Wallet Address
            </label>
            <div className="mt-1">
              {!isWalletConnected && renderWalletConnectComponent(account, web3Modal, dispatch)}
            </div>
            <form onSubmit={handleSubmit(handleSolveFormSubmit)} className="space-y-6">
              <div>
                {isWalletConnected && renderWalletAddressInputField(account)}
              </div>
              <div className="">
                <label
                  htmlFor="about"
                  className="block text-sm font-medium text-gray-700"
                >
                  Solution Description
                </label>
                <div className="mt-1">
                            <textarea
                              {...register('description')}
                              id="description"
                              name="description"
                              required
                              rows={3}
                              className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border border-gray-300 rounded-sm"
                              defaultValue={''}
                            />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Check out the task description and submit your answer here.
                </p>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={!isWalletConnected}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none"
                >
                  Submit Solution
                </button>
              </div>
            </form>
          </div>
        </div>
      case SharePageState.PendingSolve:
        return <div><p className="text-sm text-gray-500">
          Pending submission
        </p></div>
      case SharePageState.SuccessSubmitSolve:
        return <div><p className="text-sm text-gray-500">
          Success. Link to transaction on blockchain here as confirmation.
          Nothing much to see here otherwise.
        </p></div>
    }
  }

  const renderShareModal = includes(shareStates, sharePageState)
  const renderSolveModal = includes(solveStates, sharePageState)

  // @ts-ignore
  return (
    <div className="relative bg-gradient-to-tr from-red-500 via-gray-700 to-gray-800 overflow-hidden min-h-screen">
      <div className="relative pt-6 pb-16 sm:pb-24">
        <Web3NavBar web3Modal={web3Modal} />
        {renderShareModal &&
          <ModalComponent
            renderContent={renderShareModalContent}
            titleText="Share task and earn"
            onClose={onModalClose}
          />}
        {renderSolveModal &&
          <ModalComponent
            renderContent={renderSolveModalContent}
            titleText="Solve this task and earn"
            onClose={onModalClose}
          />}
        <main className="mt-16 sm:mt-24">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-6 lg:gap-8">
              <div
                className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
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
                      Thank you for being here {sharePageState}
                    </span>
                    <ChevronRightIcon
                      className="ml-2 w-5 h-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </a>
                  <h1
                    className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                    {/* <span className="md:block">asdasd</span>{' '} */}
                    <span className="text-yellow-400 md:block">
                      {taskObject.title}
                    </span>
                  </h1>
                  <div className="">
                    <div className="lg:max-w-6xl lg:mx-auto">
                      <div className="py-6 md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <Image
                              className="hidden h-16 w-16 rounded-full sm:block"
                              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80"
                              alt=""
                              width="50"
                              height="50"
                            />
                            <div>
                              <div className="flex items-center">
                                {/* <Image */}
                                {/*   className="h-12 w-12 rounded-full sm:hidden" */}
                                {/*   src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80" */}
                                {/*   alt="" */}
                                {/*   width="30" */}
                                {/*   height="30" */}
                                {/* /> */}
                                <h1
                                  className="ml-3 text-xl font-bold leading-7 text-gray-100 sm:leading-9 sm:truncate">
                                  {taskObject.owner}
                                </h1>
                              </div>
                              <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
                                <dt className="sr-only">Created at</dt>
                                <dd className="flex items-center text-sm text-gray-400 font-medium capitalize sm:mr-6">
                                  <ClockIcon
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  {taskObject.createdAt}
                                </dd>
                                <dt className="sr-only">Account status</dt>
                                <dd
                                  className="mt-3 flex items-center text-sm text-gray-400 font-medium sm:mr-6 sm:mt-0 capitalize">
                                  <CheckCircleIcon
                                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"
                                    aria-hidden="true"
                                  />
                                  Verified account
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="px-4 sm:px-0 sm:text-center md:max-w-3xl md:mx-auto lg:col-span-6 lg:text-left ">
                    {renderActionButtonCard()}
                  </div>
                  <div className="mt-5 text-base text-gray-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    <ReactMarkdown
                      children={taskObject.description}
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeFormat]}
                    />
                  </div>
                </div>
              </div>
              {/* <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6"> */}
              {/*   <div className="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-sm sm:overflow-hidden"> */}
              {/*     <div className="px-4 py-8 sm:px-10"> */}
              {/*       <div className="mt-6"> */}
              {/*         <form onSubmit={(e) => alert(e)} className="space-y-6"> */}
              {/*           <div> */}
              {/*             <label */}
              {/*               htmlFor="walletAddress" */}
              {/*               className="block text-sm font-medium text-gray-700" */}
              {/*             > */}
              {/*               Wallet Address */}
              {/*             </label> */}
              {/*             {isWalletConnected ? ( */}
              {/*               <input */}
              {/*                 type="text" */}
              {/*                 name="walletAddress" */}
              {/*                 id="walletAddress" */}
              {/*                 placeholder="Wallet Address" */}
              {/*                 value={account} */}
              {/*                 disabled={true} */}
              {/*                 className="select-none text-gray-600 mt-1 block w-full shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300 rounded-sm" */}
              {/*               /> */}
              {/*             ) : ( */}
              {/*               <div className="mt-1"> */}
              {/*                 {renderWalletConnectComponent(account, web3Modal, dispatch)} */}
              {/*               </div> */}
              {/*             )} */}
              {/*           </div> */}
              {/*           {renderFormField({ */}
              {/*             register, */}
              {/*             name: 'email', */}
              {/*             type: 'email', */}
              {/*             required: true */}
              {/*           })} */}
              {/*           {renderFormField({ */}
              {/*             register, */}
              {/*             name: 'taskTitle', */}
              {/*             type: 'text', */}
              {/*             required: true */}
              {/*           })} */}
              {/*           <div className=""> */}
              {/*             <label */}
              {/*               htmlFor="about" */}
              {/*               className="block text-sm font-medium text-gray-700" */}
              {/*             > */}
              {/*               Task Description */}
              {/*             </label> */}
              {/*             <div className="mt-1"> */}
              {/*               <textarea */}
              {/*                 {...register('description')} */}
              {/*                 id="description" */}
              {/*                 name="description" */}
              {/*                 required */}
              {/*                 rows={3} */}
              {/*                 className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border border-gray-300 rounded-sm" */}
              {/*                 defaultValue={''} */}
              {/*               /> */}
              {/*             </div> */}
              {/*             <p className="mt-2 text-sm text-gray-500"> */}
              {/*               Write a few sentences about the task and how others */}
              {/*               can fulfill it. */}
              {/*             </p> */}
              {/*           </div> */}
              {/*           <div> */}
              {/*             <button */}
              {/*               type="submit" */}
              {/*               disabled={!isWalletConnected} */}
              {/*               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none" */}
              {/*             > */}
              {/*               Submit Task */}
              {/*             </button> */}
              {/*           </div> */}
              {/*         </form> */}
              {/*       </div> */}
              {/*     </div> */}
              {/*     <div className="px-4 py-6 bg-gray-50 border-t-2 border-gray-200 sm:px-10"> */}
              {/*       <p className="text-xs leading-5 text-gray-500"> */}
              {/*         By signing up, you agree to be{' '} */}
              {/*         <a */}
              {/*           href="#" */}
              {/*           className="font-medium text-gray-900 hover:underline" */}
              {/*         > */}
              {/*           kind */}
              {/*         </a>{' '} */}
              {/*         and{' '} */}
              {/*         <a */}
              {/*           href="#" */}
              {/*           className="font-medium text-gray-900 hover:underline" */}
              {/*         > */}
              {/*           extra chill */}
              {/*         </a> */}
              {/*         . */}
              {/*       </p> */}
              {/*     </div> */}
              {/*   </div> */}
              {/* </div> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
