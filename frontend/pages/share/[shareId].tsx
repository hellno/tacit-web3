import { useContext, useEffect, useState } from 'react'
import { CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { get, includes, invert, isEmpty } from 'lodash'
import { useForm } from 'react-hook-form'
import { loadWeb3Modal, renderWalletConnectComponent } from '../../src/walletUtils'
import { sleep } from '../../src/utils'
import { AppContext } from '../../src/context'
import ReactMarkdown from 'react-markdown'
import rehypeFormat from 'rehype-format'
import remarkGfm from 'remark-gfm'
import ModalComponent from '../../src/components/ModalComponent'
// eslint-disable-next-line node/no-missing-import
import { SharePageState, shareStates, solveStates } from '../../src/const'
import { renderWalletAddressInputField } from '../../src/formUtils'
import Web3NavBar from '../../src/components/Web3NavBar'
import LoadingScreenComponent from '../../src/components/LoadingScreenComponent'
import BlockiesComponent from '../../src/components/BlockiesComponent'
import { isEthBounty, nameToTokenAddress } from '../../src/constDeployedContracts'
import { ethers } from 'ethers'

// eslint-disable-next-line no-unused-vars
const exampleSharePageObject = {
  title: 'Looking for a Smart Contract Developer',
  description: 'asdasd',
  ownerAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  taskData: '0x6261667962656967796866626b3273337062743334716479727870737432776271656e676861336e37657a69716b76346b72626176766a6f356d6d2f3163323130353564323231653638346438373339363738613165353161343734',
  taskIsOpen: true,
  bountyTokenAddress: '0x0000000000000000000000000000000000000000',
  bountyAmount: '12.0'
}

export async function getStaticProps ({ params }) {
  const { shareId } = params
  const apiEndpoint = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://web3.tacit.so'
  const apiUrl = `${apiEndpoint}/api/getSharePageData/${shareId}/`
  console.log('getStaticProps with internal API URL', apiUrl)
  const res = await fetch(apiUrl)
  const taskObject = await res.json()
  return {
    props: {
      taskObject
    }
    // revalidate: 42000
  }
}

export async function getStaticPaths () {
  // can add some paths by reading from shares on smart-contract by default later
  const paths = []

  // fallback: true means that the missing pages
  // will not 404, and instead can render a fallback.
  return {
    paths,
    fallback: true
  }
}

export default function SharePage ({ taskObject }) {
  console.log({ taskObject })
  const [state, dispatch] = useContext(AppContext)
  const isLoading = isEmpty(taskObject)
  // const [isLoading, setIsLoading] = useState(false)
  // const [isError, setIsError] = useState()
  // const [taskObject, setTaskObject] = useState(false)

  const {
    web3Modal,
    account
  } = state
  const [sharePageState, setSharePageState] = useState<SharePageState>(SharePageState.Default)

  const {
    register,
    handleSubmit
  } = useForm()

  useEffect(() => {
    loadWeb3Modal(dispatch)
  }, [])

  const renderLoadingScreen = () => (
    <LoadingScreenComponent subtitle={'Fetching on-chain data and task details from IPFS'} />
  )

  if (isLoading) {
    return renderLoadingScreen()
  }

  const isWalletConnected = !isEmpty(account)

  const onModalClose = () => {
    setSharePageState(SharePageState.Default)
  }

  // eslint-disable-next-line no-unused-vars
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

  const renderBounty = () => {
    if (isEthBounty(taskObject.bountyTokenAddress)) {
      return `${taskObject.bountyAmount} ETH`
    } else {
      const tokenAmountStr = ethers.utils.formatUnits(taskObject.bountyAmount)
      const userTokenAmount = Math.round((parseFloat(tokenAmountStr) + Number.EPSILON) * 100) / 100
      const tokenCurrency = get(invert(nameToTokenAddress), taskObject.bountyTokenAddress)
      return `${userTokenAmount} ${tokenCurrency}`
    }
  }

  function renderPageContent () {
    if (isEmpty(taskObject)) {
      return <></>
    }
    return <main className="mt-16 sm:mt-24">
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
                  Thank you for being here
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
              <h1
                className="mt-2 text-2xl tracking-tight font-bold text-white sm:leading-none lg:mt-2 lg:text-2xl xl:text-4xl">
                {/* <span className="md:block">asdasd</span>{' '} */}
                Bounty: {renderBounty()}
              </h1>
              <div className="lg:max-w-6xl lg:mx-auto">
                <div className="py-6 md:flex md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <BlockiesComponent
                        opts={{
                          seed: taskObject.ownerAddress,
                          color: '#dfe'
                          // size: 15
                          // scale: 3,
                        }} />
                      {/* <Image */}
                      {/*   className="hidden h-16 w-16 rounded-full sm:block" */}
                      {/*   // src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80" */}
                      {/*   src={`url(${blockies.create({ */}
                      {/*     seed: taskObject.ownerAddress, */}
                      {/*     size: 8, */}
                      {/*     scale: 16 */}
                      {/*   }).toDataURL()})`} */}
                      {/*   alt="" */}
                      {/*   width="50" */}
                      {/*   height="50" */}
                      {/* /> */}
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
                            {taskObject.ownerAddress}
                          </h1>
                        </div>
                        <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
                          {/* <dt className="sr-only">Created at</dt> */}
                          {/* <dd className="flex items-center text-sm text-gray-400 font-medium capitalize sm:mr-6"> */}
                          {/*   <ClockIcon */}
                          {/*     className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" */}
                          {/*     aria-hidden="true" */}
                          {/*   /> */}
                          {/*   {taskObject.createdAt} */}
                          {/* </dd> */}
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
  }

  return (
    <div className="relative bg-gradient-to-tr from-red-500 via-gray-700 to-gray-800 overflow-hidden min-h-screen">
      <div className="relative pt-6 pb-16 sm:pb-24">
        <Web3NavBar />
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
        {renderPageContent()}
      </div>
    </div>
  )
}
