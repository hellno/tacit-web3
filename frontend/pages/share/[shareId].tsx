import { useContext, useEffect, useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { includes, isEmpty } from 'lodash'
import { useForm } from 'react-hook-form'
import {
  getDefaultTransactionGasOptions,
  getTaskPortalContractInstanceViaActiveWallet,
  loadWeb3Modal,
  renderWalletConnectComponent
} from '../../src/walletUtils'
// @ts-ignore
import { getBountyStringFromTaskObject } from '../../src/utils'
import { AppContext } from '../../src/context'
import ReactMarkdown from 'react-markdown'
import rehypeFormat from 'rehype-format'
import remarkGfm from 'remark-gfm'
import ModalComponent from '../../src/components/ModalComponent'
// eslint-disable-next-line node/no-missing-import
import { NodeType, SharePageState, shareStates, solveStates } from '../../src/const'
import { renderFormField, renderWalletAddressInputField } from '../../src/formUtils'
import Web3NavBar from '../../src/components/Web3NavBar'
import LoadingScreenComponent from '../../src/components/LoadingScreenComponent'
import BlockiesComponent from '../../src/components/BlockiesComponent'
import { ethers } from 'ethers'
import PresentActionLinksComponent from '../../src/components/PresentActionLinksComponent'

interface ShareSubmissionStateType {
  name: SharePageState;
  data?: object;
}

export default function SharePage ({ shareObject }) {
  console.log({ shareObject })
  const [state, dispatch] = useContext(AppContext)
  const isLoading = isEmpty(shareObject)
  // const [isLoading, setIsLoading] = useState(false)
  // const [isError, setIsError] = useState()
  // const [taskObject, setTaskObject] = useState(false)

  const {
    web3Modal,
    library,
    network,
    account
  } = state
  const [sharePageData, setSharePageData] = useState<ShareSubmissionStateType>({ name: SharePageState.Default })

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
    setSharePageData({
      name: SharePageState.Default
    })
  }

  const handleSolveFormSubmit = async (formData) => {
    setSharePageData({ name: SharePageState.PendingSolve })

    const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(library, network.chainId)
    const options = getDefaultTransactionGasOptions()
    const solutionData = ethers.utils.toUtf8Bytes(JSON.stringify(formData.solution))
    const addSolutionTransaction = await taskPortalContract.addSolution(shareObject.path, solutionData, options)
    const res = await addSolutionTransaction.wait()

    console.log('Transaction successfully executed:', addSolutionTransaction, res)

    const data = {
      transactionHash: addSolutionTransaction.hash
    }

    setSharePageData({
      name: SharePageState.SuccessSubmitSolve,
      data
    })
  }

  const handleShareFormSubmit = async (formData) => {
    setSharePageData({ name: SharePageState.PendingShare })

    const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(library, network.chainId)
    const options = getDefaultTransactionGasOptions()

    const addShareTransaction = await taskPortalContract.addShare(shareObject.path, ethers.utils.toUtf8Bytes(' '), options)
    const res = await addShareTransaction.wait()

    console.log('Transaction successfully executed:', addShareTransaction, res)
    console.log('events', res.events)

    const shareEvent = res.events.find(event => event.event === 'NewNodeCreated' && event.args.nodeType === NodeType.Share)
    const data = {
      transactionHash: addShareTransaction.hash,
      sharePath: shareEvent.args.path
    }

    setSharePageData({
      name: SharePageState.SuccessSubmitShare,
      data
    })
  }

  const renderActionButtonCard = () => {
    return (
      <div className="mx-auto py-12">
        <div className="mt-4 flex grid grid-cols-2 gap-x-4">
          <div>
            <div className="inline-flex rounded-sm shadow">
              <button
                onClick={() => setSharePageData({ name: SharePageState.ShareIntent })}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-sm text-yellow-800 bg-yellow-200 hover:bg-yellow-100"
              >
                Get unique link to share and earn
              </button>
            </div>
            <span className="block mt-2 pr-4 text-base font-normal text-gray-100">
              You get part of the reward if someone downstream of your unique link enters a winning result.
            </span>
          </div>
          <div>
            <div className="inline-flex">
              <button
                onClick={() => setSharePageData({ name: SharePageState.SolveIntent })}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-sm text-yellow-800 bg-yellow-100 hover:bg-yellow-200"
              >
                Enter results
              </button>
            </div>
            <span className="block mt-2 pr-4 text-base font-normal text-gray-100">
              Enter requested
              results to
              become eligible
              for a reward.
            </span>
          </div>
        </div>
      </div>)
  }

  const renderShareModalContent = () => {
    switch (sharePageData.name) {
      case SharePageState.ShareIntent:
        // @ts-ignore
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
              {isWalletConnected && renderWalletAddressInputField(account)}
              <div>
                {renderFormField({
                  register,
                  name: 'email',
                  type: 'email',
                  // @ts-ignore
                  label: 'Your Email'
                })}
                <p className="mt-2 text-sm text-gray-500">
                  Enter your email so that the poster can get in touch with you if needed (not stored on-chain).
                </p>
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
        return <div>
          <p className="text-sm text-gray-500">
            You did it 🥳
          </p>
          <PresentActionLinksComponent data={sharePageData.data} />
        </div>
      default:
        break
    }
  }

  const renderSolveModalContent = () => {
    switch (sharePageData.name) {
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
              {isWalletConnected && renderWalletAddressInputField(account)}
              <div>
                {renderFormField({
                  register,
                  name: 'email',
                  type: 'email',
                  // @ts-ignore
                  label: 'Your Email'
                })}
                <p className="mt-2 text-sm text-gray-500">
                  Enter your email so that the poster can get in touch with you if needed (not stored on-chain).
                </p>
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
                    {...register('solution')}
                    id="solution"
                    name="solution"
                    required
                    rows={3}
                    className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border border-gray-300 rounded-sm"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This could be your email address, your Discord name, your Twitter handle or something else the poster
                  requested.
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
        return <div>
          <p className="text-sm text-gray-500">
            You did it 🥳 The poster has now received your answer and will be in touch.
          </p>
          <PresentActionLinksComponent data={sharePageData.data} />
        </div>
    }
  }

  const renderShareModal = includes(shareStates, sharePageData.name)
  const renderSolveModal = includes(solveStates, sharePageData.name)

  function renderPageContent () {
    if (isEmpty(shareObject)) {
      return <></>
    }
    return <main className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-7xl">
        <div className="lg:grid lg:grid-cols-6 lg:gap-8">
          <div
            className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
            <div>
              <div
                className="inline-flex items-center text-white bg-gray-900 rounded-full p-1 pr-2 sm:text-base lg:text-sm xl:text-base"
              >
                <span
                  className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-yellow-500 rounded-full">
                  WAGMI
                </span>
                <span className="ml-4 mr-2 text-sm">
                  Thank you for being here
                </span>
              </div>
              <h1
                className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                {/* <span className="md:block">asdasd</span>{' '} */}
                <span className="text-yellow-400 md:block">
                  {shareObject.title}
                </span>
              </h1>
              <h1
                className="mt-2 text-2xl tracking-tight font-bold text-white sm:leading-none lg:mt-2 lg:text-2xl xl:text-4xl">
                {/* <span className="md:block">asdasd</span>{' '} */}
                Bounty: {getBountyStringFromTaskObject(shareObject)}
              </h1>
              <div className="lg:max-w-6xl lg:mx-auto">
                <div className="py-6 md:flex md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <BlockiesComponent
                        opts={{
                          seed: shareObject.ownerAddress,
                          color: '#dfe'
                          // size: 15
                          // scale: 3,
                        }} />
                      <div>
                        <div className="flex items-center">
                          <h1
                            className="ml-3 text-xl font-bold leading-7 text-gray-100 sm:leading-9 sm:truncate">
                            {shareObject.ownerAddress}
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
                  children={shareObject.description}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeFormat]}
                />
              </div>
            </div>
          </div>
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
  const shareObject = await res.json()
  return {
    props: {
      shareObject
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
