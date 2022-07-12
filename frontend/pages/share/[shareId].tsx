import { useContext, useEffect, useState } from 'react'
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/solid'
import { escape, get, includes, isEmpty } from 'lodash'
import { useForm } from 'react-hook-form'
import {
  getBaseBiconomyGaslessTransactionParams,
  getTaskPortalContractInstanceViaActiveWallet,
  loadWeb3Modal,
  renderWalletConnectComponent,
  switchNetwork
} from '../../src/walletUtils'
import { classNames, getBountyAmountWithCurrencyStringFromTaskObject, getSiteUrl, isProdEnv } from '../../src/utils'
import { AppContext } from '../../src/context'
import ModalComponent from '../../src/components/ModalComponent'
// eslint-disable-next-line node/no-missing-import
import { BiconomyLoadingState, NodeType, SharePageState, shareStates, solveStates } from '../../src/const'
import { renderFormField, renderWalletAddressInputField } from '../../src/formUtils'
import Web3NavBar from '../../src/components/Web3NavBar'
import LoadingScreenComponent from '../../src/components/LoadingScreenComponent'
import { ethers } from 'ethers'
import PresentActionLinksComponent from '../../src/components/PresentActionLinksComponent'
import { MarkdownComponent } from '../../src/markdownUtils'
import { addUserToDatabase } from '../../src/supabase'
import { Biconomy } from '@biconomy/mexa'
import { getDeployedContractForChainId } from '../../src/constDeployedContracts'
import Head from 'next/head'

interface ShareSubmissionStateType {
  name: SharePageState;
  data?: object;
}

interface BiconomyLoadingStateType {
  name: BiconomyLoadingState,
  biconomy?: Biconomy
}

function SharePage ({ shareObject }) {
  const [state, dispatch] = useContext(AppContext)
  const isLoading = isEmpty(shareObject)
  const [biconomyState, setBiconomyState] = useState<BiconomyLoadingStateType>({
    name: BiconomyLoadingState.Default,
    biconomy: null
  })

  const {
    web3Modal,
    network,
    provider,
    account,
    ensName
  } = state
  const [sharePageData, setSharePageData] = useState<ShareSubmissionStateType>({ name: SharePageState.Default })

  const {
    register,
    handleSubmit
  } = useForm()

  useEffect(() => {
    loadWeb3Modal(dispatch)
  }, [])

  useEffect(() => {
    setupBiconomy()
  }, [provider])

  const setupBiconomy = async () => {
    if (!provider) {
      return
    }

    if (biconomyState.name === BiconomyLoadingState.Success) {
      return
    }

    setBiconomyState({ name: BiconomyLoadingState.Init })
    const biconomyOptions = {
      apiKey: network.chainId === 100 ? process.env.BICONOMY_GNOSIS_API_KEY : process.env.BICONOMY_GOERLI_API_KEY,
      walletProvider: provider,
      debug: true
    }
    // const gnosisRpcUrl = 'https://gnosis-mainnet.public.blastapi.io/'
    const gnosisRpcUrl = 'https://rpc.ankr.com/gnosis'
    // const gnosisRpcUrl = 'https://gnosischain-rpc.gateway.pokt.network/'
    // const gnosisRpcUrl = 'https://rpc.gnosischain.com/'
    console.log('gnosis rpc url', gnosisRpcUrl)
    const rpcUrl = network.chainId === 100 ? gnosisRpcUrl : process.env.INFURA_RPC_ENDPOINT
    const jsonRpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const biconomy = new Biconomy(jsonRpcProvider, biconomyOptions)

    setBiconomyState({
      name: BiconomyLoadingState.Loading,
      biconomy
    })
  }

  useEffect(() => {
    if (biconomyState.name === BiconomyLoadingState.Loading) {
      biconomyState.biconomy.onEvent(biconomyState.biconomy.READY, () => {
        if (biconomyState.name !== BiconomyLoadingState.Success) {
          console.log('biconomy is ready')
          setBiconomyState({
            name: BiconomyLoadingState.Success,
            biconomy: biconomyState.biconomy
          })
        }
      }).onEvent(biconomyState.biconomy.ERROR, (error, message) => {
        console.log('biconomy has an error', error, message)
        setBiconomyState({
          name: BiconomyLoadingState.Error,
          biconomy: error
        })
      })
    }
  }, [biconomyState.name])

  const renderLoadingScreen = () => (
    <LoadingScreenComponent subtitle={'Fetching on-chain data and task details from IPFS'} />
  )

  if (isLoading) {
    return renderLoadingScreen()
  }

  const isWalletConnected = !isEmpty(account)
  const isGaslessTransactionsReady = biconomyState.name === BiconomyLoadingState.Success
  const isUserOnCorrectChain = isWalletConnected && shareObject && shareObject.chainId === network.chainId
  const canSubmitActions = isUserOnCorrectChain && isGaslessTransactionsReady
  const walletAddress = ensName || account

  const resetToDefaultState = () => {
    setSharePageData({
      name: SharePageState.Default
    })
  }

  const onModalClose = () => {
    resetToDefaultState()
  }

  const handleSolveFormSubmit = async (formData) => {
    setSharePageData({ name: SharePageState.PendingSolve })

    const solutionData = ethers.utils.toUtf8Bytes(JSON.stringify(formData.solution))
    const signer = biconomyState.biconomy.getSignerByAddress(account)
    const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(signer, network.chainId)
    const { contractAddress } = getDeployedContractForChainId(network.chainId)
    const { data: populateTransactionData } = await taskPortalContract.populateTransaction.addSolution(shareObject.path, solutionData)

    const txParams = {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...getBaseBiconomyGaslessTransactionParams(),
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...{
        data: populateTransactionData,
        to: contractAddress,
        from: account
      }
    }
    const biconomyProvider = new ethers.providers.Web3Provider(biconomyState.biconomy)
    let res
    try {
      res = await biconomyProvider.send('eth_sendTransaction', [txParams])
    } catch (e) {
      console.log('caught error ', e)
      const errorMessage = get(e, 'message') || JSON.parse(e.error.body).error.message
      console.log('got error message when interacting with contract', errorMessage)
      setSharePageData({
        name: SharePageState.FailSubmitSolve,
        data: errorMessage
      })
      return
    }
    console.log('Transaction successfully executed:', res)

    const data = {
      transactionHash: res
    }

    const { email } = formData
    if (email) {
      await addUserToDatabase({
        walletAddress: account,
        email
      })
    }

    setSharePageData({
      name: SharePageState.SuccessSubmitSolve,
      data
    })
  }

  // eslint-disable-next-line no-unused-vars
  const submitTransactionWithUserPaysForGas = () => {
    // const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(library.getSigner(), network.chainId)
    // const options = getDefaultTransactionGasOptions()
    // const addShareTransaction = await taskPortalContract.addShare(shareObject.path, transactionData, options)
    // const res = await addShareTransaction.wait()
  }

  const handleShareFormSubmit = async (formData) => {
    setSharePageData({ name: SharePageState.PendingShare })

    const transactionData = ethers.utils.toUtf8Bytes(' ')

    const signer = biconomyState.biconomy.getSignerByAddress(account)
    const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(signer, network.chainId)

    taskPortalContract.on('NodeUpdated', (path, owner, nodeType, parent) => {
      if (owner === account && nodeType === NodeType.Share) {
        setSharePageData({
          name: SharePageState.SuccessSubmitShare,
          data: {
            sharePath: path
          }
        })
      }
    })

    const { contractAddress } = getDeployedContractForChainId(network.chainId)
    const { data: populateTransactionData } = await taskPortalContract.populateTransaction.addShare(shareObject.path, transactionData)

    const txParams = {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...getBaseBiconomyGaslessTransactionParams(),
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...{
        data: populateTransactionData,
        to: contractAddress,
        from: account
      }
    }

    const biconomyProvider = new ethers.providers.Web3Provider(biconomyState.biconomy)
    let res
    try {
      res = await biconomyProvider.send('eth_sendTransaction', [txParams])
    } catch (e) {
      console.log('caught error ', e)
      const errorMessage = get(e, 'message') || JSON.parse(e.error.body).error.message
      console.log('got error message when interacting with contract', errorMessage)
      setSharePageData({
        name: SharePageState.FailSubmitShare,
        data: errorMessage
      })
      return
    }

    console.log('Transaction successfully executed:', res)
    setSharePageData({
      name: SharePageState.PendingShare,
      data: {
        transactionHash: res
      }
    })

    const { email } = formData
    if (email) {
      await addUserToDatabase({
        walletAddress: account,
        email
      })
    }
  }

  const renderWalletSwitchIfNeeded = () => {
    return !isUserOnCorrectChain &&
      <div className="mb-6">
        <button
          onClick={() => switchNetwork(provider, shareObject.chainId).then(() => window.location.reload())}
          type="button"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none"
        >
          Switch to {getDeployedContractForChainId(shareObject.chainId).name}
        </button>
      </div>
  }

  const renderGaslessTransactionSetupProgress = () => {
    switch (biconomyState.name) {
      case BiconomyLoadingState.Success:
        return <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Free / Gas-less Transactions are ready for you</p>
            </div>
          </div>
        </div>
      case BiconomyLoadingState.Error:
        return <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Something went wrong when loading gasless transactions
                for you</h3>
              <div className="mt-2 text-sm text-red-700">
                {biconomyState.biconomy}
              </div>
            </div>
          </div>
        </div>
      case BiconomyLoadingState.Loading:
        return <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">Setting up free / gas-less transaction for you</p>
              {/* <p className="mt-3 text-sm md:mt-0 md:ml-6"> */}
              {/*   <a href="#" className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"> */}
              {/*     Details <span aria-hidden="true">&rarr;</span> */}
              {/*   </a> */}
              {/* </p> */}
            </div>
          </div>
        </div>
    }
  }

  const renderActionButtonCard = () => {
    return (
      <div className="mx-auto py-12">
        <div className="mt-4 flex grid grid-cols-2 gap-x-2">
          <div>
            <div className="inline-flex">
              <button
                onClick={() => setSharePageData({ name: SharePageState.SolveIntent })}
                className="min-w-fit md:w-60 inline-flex items-center justify-center px-5 py-3 border border-transparent shadow-md shadow-gray-500 text-base font-semibold rounded-sm text-primary bg-gray-100 hover:bg-light"
              >
                {shareObject.ctaSolution || 'Solve task and earn'}
              </button>
            </div>
            <span className="md:w-60 md:text-center inline-flex mt-2 pr-4 text-base font-normal text-gray-100">
              Enter requested results to become eligible for a reward
            </span>
          </div>
          <div>
            <div className="inline-flex">
              <button
                onClick={() => setSharePageData({ name: SharePageState.ShareIntent })}
                className="min-w-fit md:w-60 inline-flex items-center justify-center px-5 py-3 border border-transparent shadow-md shadow-gray-500 text-base font-semibold rounded-sm text-light bg-primary hover:bg-primary-light"
              >
                {shareObject.ctaReferral || 'Get referral link'}
              </button>
            </div>
            <span
              className="md:w-60 md:text-center items-center inline-flex mt-2 pr-4 text-base font-normal text-gray-100">
              Invite others to earn and get a share of their reward
            </span>
          </div>
        </div>
      </div>)
  }

  const renderShareModalContent = () => {
    switch (sharePageData.name) {
      case SharePageState.ShareIntent:
        return <div>
          <div className="mt-6 mr-8">
            {renderWalletSwitchIfNeeded()}
            <label
              htmlFor="walletAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Wallet Address
            </label>
            <div className="mt-1">
              {!isWalletConnected && renderWalletConnectComponent({
                web3Modal,
                dispatch,
                onSubmitFunc: resetToDefaultState
              })}
            </div>
            <form onSubmit={handleSubmit(handleShareFormSubmit)} className="space-y-4">
              <div>
                {isWalletConnected && renderWalletAddressInputField(walletAddress)}
              </div>
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
                  disabled={!canSubmitActions}
                  className={classNames(
                    canSubmitActions && 'hover:bg-primary-light',
                    'w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-primary focus:outline-none')}
                >
                  Create my share link
                </button>
              </div>
              {renderGaslessTransactionSetupProgress()}
            </form>
          </div>
        </div>
      case SharePageState.PendingShare:
        return <div><p className="text-sm text-gray-500 animate-pulse">
          Pending submission ...
        </p></div>
      case SharePageState.SuccessSubmitShare:
        return <div>
          <p className="text-sm text-gray-500">
            You did it 🥳
          </p>
          <PresentActionLinksComponent data={sharePageData.data} />
        </div>
      case SharePageState.FailSubmitShare:
        return <div>
          <p className="text-sm text-gray-500">
            Sorry, something went wrong here
          </p>
          <p className="mt-4 p-2 text-sm text-gray-600 bg-red-100 rounded-sm">{sharePageData.data}</p>
        </div>
      default:
        break
    }
  }

  const renderSolveModalContent = () => {
    switch (sharePageData.name) {
      case SharePageState.SolveIntent:
        return <div>
          <div className="mt-6 mr-8">
            {renderWalletSwitchIfNeeded()}
            <label
              htmlFor="walletAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Wallet Address
            </label>
            <div className="mt-1">
              {!isWalletConnected && renderWalletConnectComponent({
                web3Modal,
                dispatch,
                onSubmitFunc: resetToDefaultState
              })}
            </div>
            <form onSubmit={handleSubmit(handleSolveFormSubmit)} className="space-y-4">
              <div>
                {isWalletConnected && renderWalletAddressInputField(walletAddress)}
              </div>
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
                    className="shadow-sm focus:ring-gray-500 block w-full sm:text-sm border border-gray-300 rounded-sm"
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
                  disabled={!canSubmitActions}
                  className={classNames(canSubmitActions && 'hover:bg-primary-light', 'w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-primary focus:outline-none')}
                >
                  Submit Solution
                </button>
              </div>
              {renderGaslessTransactionSetupProgress()}
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
      case SharePageState.FailSubmitSolve:
        return <div>something went wrong here :(</div>
    }
  }

  const renderShareModal = includes(shareStates, sharePageData.name)
  const renderSolveModal = includes(solveStates, sharePageData.name)

  const getBountyDescription = () => shareObject.subtitle ? shareObject.subtitle : `Bounty: ${getBountyAmountWithCurrencyStringFromTaskObject(shareObject.bounties[0], shareObject.chainId)}`

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
                  className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-secondary rounded-full">
                  WAGMI
                </span>
                <span className="ml-4 mr-2 text-sm">
                  Thank you for being here
                </span>
              </div>
              <h1
                className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                {/* <span className="md:block">asdasd</span>{' '} */}
                <span className="text-primary md:block">
                  {shareObject.title}
                </span>
              </h1>
              <h1
                className="mt-2 text-2xl tracking-tight font-bold text-white sm:leading-none lg:mt-2 lg:text-2xl xl:text-4xl">
                {getBountyDescription()}
              </h1>
              <div
                className="px-4 sm:px-0 sm:text-center md:max-w-3xl md:mx-auto lg:col-span-6 lg:text-left ">
                {renderActionButtonCard()}
              </div>
              <div className="mt-5 text-base text-gray-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                <MarkdownComponent content={shareObject.description} />
              </div>
              <div className="lg:max-w-6xl lg:mx-auto">
                <div className="py-6 md:flex md:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div>
                        <dd
                          className="flex items-left text-sm text-gray-400 font-medium sm:mr-6 sm:mt-0">
                          Created by verified account
                          <CheckCircleIcon
                            className="flex-shrink-0 ml-1 mt-0.5 h-4 w-4 text-green-400"
                            aria-hidden="true"
                          />
                        </dd>
                        <div className="flex items-center">
                          <h1
                            className="text-xl font-bold leading-7 text-gray-100 sm:leading-9 sm:truncate">
                            {shareObject.ownerAddress}
                          </h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  }

  const renderPageMetaProperties = () => {
    const title = shareObject.title
    const description = ''
    const url = getSiteUrl()
    const imageTitle = shareObject.title
    const imageBountyStr = getBountyDescription()
    const ogImageUrl = process.env.OG_IMAGE_URL
    const imageUrl = isProdEnv() && ogImageUrl && encodeURI(`${ogImageUrl}api/og-image?title=${escape(imageTitle)}&bounty=${escape(imageBountyStr)}`)

    return (
      <Head>
        <title>{title}</title>
        {/* <link rel="icon" href="/favicon.png" /> */}
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        // base properties
        <meta property="og:site_name" content="Tacit" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        {/* <meta property="og:title" key="ogtitle" content={title} /> */}
        {/* <meta property="og:description" key="ogdesc" content={description} /> */}
        // image properties
        {imageUrl && (<>
          <meta property="og:image" content={imageUrl} />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:width" content="1200" />
        </>)}
        // twitter properties
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content={process.env.SITE} />
        <meta property="twitter:url" content={url} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {imageUrl && (<meta name="twitter:image" content={imageUrl} />)}
      </Head>
    )
  }

  return (
    <>
      {renderPageMetaProperties()}
      <div className="relative bg-background overflow-hidden min-h-screen">
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
    </>
  )
}

export async function getStaticProps ({ params }) {
  const { shareId } = params
  const apiEndpoint = getSiteUrl()
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
  // can later add some share paths from on-chain data via smart-contract
  const paths = []

  // fallback: true means that the missing pages
  // will not 404, and instead can render a fallback.
  return {
    paths,
    fallback: true
  }
}

export default SharePage
