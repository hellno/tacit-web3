import { useEffect, useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { escape, get, includes, isEmpty, map, merge } from 'lodash'
import { colors } from '../../colors'
import tinycolor from 'tinycolor2'
import {
  getBaseBiconomyGaslessTransactionParams,
  getTaskPortalContractInstanceViaActiveWallet
} from '../../src/walletUtils'
import {
  classNames,
  getBountyAmountWithCurrencyStringFromTaskObject,
  getSiteUrl,
  isDevEnv,
  isProdEnv
} from '../../src/utils'
import { BiconomyLoadingState, NodeType, SharePageState, shareStates, solveStates } from '../../src/const'
import Web3NavBar from '../../src/components/Web3NavBar'
import LoadingScreenComponent from '../../src/components/LoadingScreenComponent'
import { ethers } from 'ethers'
import { addUserToDatabase } from '../../src/supabase'
import { Biconomy } from '@biconomy/mexa'
import {
  chainIdToBiconomyApiKey,
  getDeployedContractForChainId,
  taskPortalContractAbi
} from '../../src/constDeployedContracts'
import Head from 'next/head'
import { useAccount, useContractEvent, useSigner } from 'wagmi'
import { useChainId } from '../../src/useChainId'
import dynamic from 'next/dynamic'
import SharePageModal from '../../src/components/SharePageModal'

// eslint-disable-next-line node/no-unsupported-features/es-syntax
const MarkdownComponent = dynamic(() => import('../../src/components/MarkdownComponent'))

interface ShareSubmissionStateType {
  name: SharePageState;
  data?: object;
}

interface BiconomyLoadingStateType {
  name: BiconomyLoadingState,
  biconomy?: Biconomy
}

function SharePage ({ shareObject }) {
  const isLoading = isEmpty(shareObject)
  const [biconomyState, setBiconomyState] = useState<BiconomyLoadingStateType>({
    name: BiconomyLoadingState.Default,
    biconomy: null
  })

  const {
    address,
    isConnected
  } = useAccount()
  const chainId = useChainId()
  const { data: walletSigner } = useSigner()

  const [pageState, setPageState] = useState<ShareSubmissionStateType>({ name: SharePageState.Default })

  useEffect(() => {
    setupBiconomy()
  }, [shareObject, chainId, isConnected])

  const biconomyApiKey = get(chainIdToBiconomyApiKey, get(shareObject, 'chainId'))

  const setupBiconomy = async () => {
    if (!biconomyApiKey || !shareObject) {
      return
    }

    if (!isConnected) {
      // reset when disconnecting
      setBiconomyState({
        name: BiconomyLoadingState.Default,
        biconomy: null
      })
      return
    }

    if (biconomyState.name === BiconomyLoadingState.Success) {
      return
    }

    console.log('run biconomy setup')
    setBiconomyState({ name: BiconomyLoadingState.Init })

    const biconomyOptions = {
      apiKey: biconomyApiKey,
      debug: isDevEnv()
    }

    const biconomy = new Biconomy(window.ethereum, biconomyOptions)

    setBiconomyState({
      name: BiconomyLoadingState.Success,
      biconomy
    })

    if (!biconomy.onEvent) {
      return
    }

    console.log('has biconomy.onEvent')
    biconomy.onEvent(biconomy.READY, () => {
      console.log('biconomy is ready')
    }).onEvent(biconomy.ERROR, (error, message) => {
      console.log('biconomy has an error', error, message)
      setBiconomyState({
        name: BiconomyLoadingState.Error,
        biconomy: error
      })
    })
  }

  const contractAddress = !isEmpty(shareObject) && shareObject.chainId ? getDeployedContractForChainId(shareObject.chainId).contractAddress : ''

  const NodeUpdatedEventListener = (event) => {
    const [path, owner, nodeType, , eventData] = event
    console.log('received new on-chain event', eventData)

    if (owner !== address) {
      return
    }

    const acceptableStateNames = [SharePageState.PendingSolve, SharePageState.PendingShare]

    if (includes(acceptableStateNames, pageState.name)) {
      console.log('processing event', eventData)
      const newStateName = nodeType === NodeType.Solution ? SharePageState.SuccessSubmitSolve : SharePageState.SuccessSubmitShare

      setPageState({
        name: newStateName,
        data: merge(pageState.data, { sharePath: path })
      })
    }
  }

  useContractEvent({
    addressOrName: contractAddress,
    contractInterface: taskPortalContractAbi,
    eventName: 'NodeUpdated',
    listener: NodeUpdatedEventListener
  })

  useEffect(() => {
    if (biconomyState.name === BiconomyLoadingState.Loading && biconomyState.biconomy.status === 'biconomy_ready') {
      console.log('biconomy is ready')
      setBiconomyState({
        name: BiconomyLoadingState.Success,
        biconomy: biconomyState.biconomy
      })
    }
  }, [biconomyState.biconomy, get(biconomyState.biconomy, 'status')])

  const renderLoadingScreen = () => (
    <LoadingScreenComponent subtitle={'Fetching on-chain data and task details from IPFS'} />
  )

  if (isLoading) {
    return renderLoadingScreen()
  }

  const isBiconomyTransaction = !isEmpty(biconomyApiKey)
  const primaryColor = get(shareObject, 'primaryColorHex') || colors.primary.DEFAULT
  const primaryColorHover = tinycolor(primaryColor).lighten(10)

  const resetToDefaultState = () => {
    setPageState({
      name: SharePageState.Default
    })
  }

  console.log('isBiconomyTransaction', isBiconomyTransaction, 'walletSigner', walletSigner)

  const handleSolveFormSubmit = async (formData) => {
    console.log({ formData })
    setPageState({ name: SharePageState.PendingSolve })
    const isSolutionForMultiQuestion = !isEmpty(formData.multiQuestionField)
    const solutionStr = JSON.stringify(isSolutionForMultiQuestion ? formData.multiQuestionField : formData.solution)
    const solutionData = ethers.utils.toUtf8Bytes(solutionStr)
    const signer = isBiconomyTransaction ? biconomyState.biconomy.ethersProvider : walletSigner
    const provider = isBiconomyTransaction ? new ethers.providers.Web3Provider(biconomyState.biconomy) : walletSigner.provider
    const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(signer, shareObject.chainId)
    const { contractAddress } = getDeployedContractForChainId(shareObject.chainId)
    const { data: populateTransactionData } = await taskPortalContract.populateTransaction.addSolution(shareObject.path, solutionData)

    const txParams = {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...getBaseBiconomyGaslessTransactionParams(),
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...{
        data: populateTransactionData,
        to: contractAddress,
        from: address
      }
    }
    let res
    try {
      // @ts-ignore
      res = await provider.send('eth_sendTransaction', [txParams])
    } catch (e) {
      console.log('caught error ', e)
      const errorMessage = get(e, 'message') || e.error.message || (e.error && e.error.body && JSON.parse(e.error.body).error.message)
      console.log('got error message when interacting with contract', errorMessage)
      setPageState({
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
        walletAddress: address,
        email
      })
    }

    setPageState({
      name: SharePageState.PendingSolve,
      data
    })
  }

  const handleShareFormSubmit = async (formData) => {
    setPageState({ name: SharePageState.PendingShare })

    const transactionData = ethers.utils.toUtf8Bytes(' ')
    const signer = isBiconomyTransaction ? biconomyState.biconomy.ethersProvider : walletSigner
    const provider = isBiconomyTransaction ? new ethers.providers.Web3Provider(biconomyState.biconomy) : walletSigner.provider
    const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(signer, shareObject.chainId)

    const { contractAddress } = getDeployedContractForChainId(shareObject.chainId)

    const { data: populateTransactionData } = await taskPortalContract.populateTransaction.addShare(shareObject.path, transactionData)

    const txParams = {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...getBaseBiconomyGaslessTransactionParams(),
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...{
        data: populateTransactionData,
        to: contractAddress,
        from: address
      }
    }

    let res
    try {
      // @ts-ignore
      res = await provider.send('eth_sendTransaction', [txParams])
    } catch (e) {
      console.log('caught error ', e)
      const errorMessage = get(e, 'message') || e.error.message || (e.error && e.error.body && JSON.parse(e.error.body).error.message)
      console.log('got error message when interacting with contract', errorMessage)
      setPageState({
        name: SharePageState.FailSubmitShare,
        data: errorMessage
      })
      return
    }

    console.log('Transaction successfully executed:', res)
    setPageState({
      name: SharePageState.PendingShare,
      data: {
        transactionHash: res
      }
    })

    const { email } = formData
    if (email) {
      await addUserToDatabase({
        walletAddress: address,
        email
      })
    }
  }

  const buttonBgPrimaryColorOnMouseOverEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColorHover
  }

  const buttonBgPrimaryColorOnMouseOutEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColor
  }

  const renderActionButtons = () => {
    const showShareButton = !get(shareObject, 'hideShareButton', false)

    return (
      <div className={classNames(showShareButton && 'md:ml-6', 'mx-auto py-12')}>
        <div className={classNames(showShareButton && 'sm:flex sm:justify-center', 'mt-5 max-w-md md:mx-0 md:mt-8')}>
          <div className="rounded-sm shadow">
            <button
              onClick={() => setPageState({ name: SharePageState.SolveIntent })}
              style={{ color: primaryColor }}
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-sm text-white bg-gray-100 hover:bg-gray-200 md:py-4 md:text-lg"
            >
              {shareObject.ctaSolution || 'Solve task and earn'}
            </button>
            <span
              className={classNames(showShareButton && 'md:w-60', 'md:text-center inline-flex mt-2 pr-4 md:pr-0 text-base font-normal text-gray-100')}>
              {shareObject.subtitleSolution || 'Enter requested results to become eligible for a reward'}
            </span>
          </div>
          {showShareButton && (<div className="mt-3 rounded-sm shadow sm:mt-0 sm:ml-3">
            <button
              style={{ backgroundColor: primaryColor }}
              onMouseOver={buttonBgPrimaryColorOnMouseOverEventHandler}
              onMouseOut={buttonBgPrimaryColorOnMouseOutEventHandler}
              onClick={() => setPageState({ name: SharePageState.ShareIntent })}
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-sm text-gray-100 bg-white hover:bg-gray-50 md:py-4 md:text-lg"
            >
              {shareObject.ctaReferral || 'Get referral link'}

            </button>
            <span
              className={classNames(showShareButton && 'md:w-60', 'md:text-center inline-flex mt-2 pr-4 md:pr-0 text-base font-normal text-gray-100')}>
              {shareObject.subtitleReferral || 'Invite others to earn and get a share of their reward'}
            </span>
          </div>)}
        </div>
      </div>)
  }

  const renderShareModal = includes(shareStates, pageState.name)
  const renderSolveModal = includes(solveStates, pageState.name)

  const getBountyDescription = () => shareObject.subtitle ? shareObject.subtitle : `Bounty: ${getBountyAmountWithCurrencyStringFromTaskObject(shareObject?.bounties[0], shareObject.chainId)}`

  function renderPageContent () {
    if (isEmpty(shareObject)) {
      return <></>
    }

    return <main className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-7xl">
        <div className="lg:grid lg:grid-cols-6 lg:gap-8">
          <div
            className="mx-4 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
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
                <span className="md:block" style={{ color: primaryColor }}>
                  {shareObject.title}
                </span>
              </h1>
              <h1
                className="mt-2 text-2xl tracking-tight font-bold text-white sm:leading-none lg:mt-2 lg:text-2xl xl:text-4xl">
                {getBountyDescription()}
              </h1>
              <div
                className="sm:px-0 sm:text-center md:max-w-3xl md:mx-auto lg:col-span-6">
                {renderActionButtons()}
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
                <div className="py-6 md:flex md:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div>
                        <dd
                          className="flex items-left text-sm text-gray-400 font-medium sm:mr-6 sm:mt-0">
                          This task is backed by
                        </dd>
                        <div className="flex items-center">
                          <h1
                            className="text-xl font-bold leading-7 text-gray-100 sm:leading-9">
                            {map(shareObject.bounties, (bounty, idx) =>
                              <p key={`bounty-${idx}`}>
                                {getBountyAmountWithCurrencyStringFromTaskObject(bounty, shareObject.chainId)}
                              </p>)
                            }
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
          {renderShareModal && <SharePageModal
            shareObject={shareObject}
            sharePageState={pageState}
            biconomyState={biconomyState}
            handleFormSubmit={handleShareFormSubmit}
            onModalClose={resetToDefaultState}
            titleText="Share this task and earn"
          />}
          {renderSolveModal && <SharePageModal
            shareObject={shareObject}
            sharePageState={pageState}
            biconomyState={biconomyState}
            handleFormSubmit={handleSolveFormSubmit}
            onModalClose={resetToDefaultState}
            titleText="Solve this task and earn"
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
    },
    revalidate: 3600 // every hour
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
