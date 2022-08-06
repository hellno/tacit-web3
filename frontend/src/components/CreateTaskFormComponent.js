import { useContext, useEffect, useState } from 'react'
import { ArrowSmRightIcon, ArrowSmUpIcon, ChevronLeftIcon, InformationCircleIcon } from '@heroicons/react/solid'
import { ethers } from 'ethers'
import { useForm } from 'react-hook-form'
import {
  getDefaultTransactionGasOptions,
  getTaskPortalContractInstanceViaActiveWallet,
  getTokenAddressToMaxAmounts,
  renderWalletConnectComponent
} from '../walletUtils'
import { AppContext } from '../context'
import { renderAmountAndCurrencyFormFields, renderFormField, renderWalletAddressInputField } from '../formUtils'
import { get, pick } from 'lodash'
import { uploadTaskDataToIpfs } from '../storageUtils'
import {
  erc20ContractAbi,
  getDeployedContractForChainId,
  getNameToTokenAddressObjectForChainId,
  isNativeChainCurrency,
  isSupportedNetwork,
  NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT,
  taskPortalContractAbi
} from '../constDeployedContracts'
// eslint-disable-next-line node/no-missing-import
import { NodeType, TASK_ALL_FORM_FIELDS } from '../const'
import { classNames, getSiteUrl, isDevEnv, sleep } from '../utils'
import { XIcon } from '@heroicons/react/outline'
import { MarkdownComponent } from '../markdownUtils'
import { addUserToDatabase } from '../supabase'
import TaskDescriptionInputField from './TaskDescriptionInputField'
// eslint-disable-next-line node/no-missing-import
import TaskAdvancedInputFields from './TaskAdvancedInputFields'
import Head from 'next/head'
import { analyticsTrackEvent } from '../analyticsUtils'
import { getReadOnlyProviderForChainId } from '../apiUtils'
import { useAccount, useContractWrite, useEnsName, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
// eslint-disable-next-line node/no-missing-import
import { useChainId } from '../useChainId'

function useMainnetEnsName (address) {
  const { data: ensName } = useEnsName({
    address,
    chainId: 1
  })

  return ensName
}

const unit = require('ethjs-unit')

const CreateTaskState = require('../const.ts').CreateTaskState

export default function CreateTaskFormComponent ({
  state: localState,
  setState
}) {
  const [globalState, dispatch] = useContext(AppContext)
  const {
    library,
    network
  } = globalState
  const {
    address,
    isConnected
  } = useAccount()
  const chainId = useChainId()

  const [nameToTokenAddress, setNameToTokenAddress] = useState({})
  const [tokenAddressToMaxAmount, setTokenAddressToMaxAmount] = useState({})
  const [showUserMessage, setShowUserMessage] = useState(true)
  const isReadyToSubmit = isConnected && isSupportedNetwork(chainId)
  const ensName = useMainnetEnsName({
    address
  })
  const walletAddress = ensName || address

  useEffect(async () => {
    if (chainId) {
      const nameToTokenAddr = getNameToTokenAddressObjectForChainId(chainId)
      setNameToTokenAddress(nameToTokenAddr)
      const provider = getReadOnlyProviderForChainId(chainId)
      setTokenAddressToMaxAmount(await getTokenAddressToMaxAmounts(nameToTokenAddr, provider, address))
    }
  }, [chainId])

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: isDevEnv() ? 'test@test.com' : '',
      title: isDevEnv() ? 'this is a sweet title' : '',
      description: isDevEnv() ? 'description 123' : '',
      tokenAmount: '1',
      tokenAddress: NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT
    }
  })

  const formTaskDescription = watch('description')
  const { contractAddress } = getDeployedContractForChainId(chainId)
  const { addTaskTransactionConfig } = usePrepareContractWrite({
    addressOrName: contractAddress,
    contractInterface: taskPortalContractAbi,
    functionName: 'addTask',
    args: [],
    overrides: {
      value: ethers.utils.parseEther('0.01')
    }
  })
  const {
    write: addTaskTransactionWrite,
    data: addTaskTransactionData
  } = useContractWrite(addTaskTransactionConfig)
  const {
    isLoading,
    isSuccess
  } = useWaitForTransaction({
    hash: addTaskTransactionData?.hash
  })

  const addTask = async (formData) => {
    let {
      email,
      tokenAmount,
      tokenAddress
    } = formData

    if (!library || !network) {
      console.log('Wallet provider object doesn\'t exist!')
      setState({ name: CreateTaskState.ErrorWalletConnect })
      return
    }

    setState({ name: CreateTaskState.PendingUploadToIpfs })
    // let dataPath
    // if (process.env.NODE_ENV === 'development') {
    //   dataPath = 'bafybeick3k3kfrapb2xpzlv2omwxgnn7fei4rioe5g2t6cm3xmalfpjqwq/cfda5d713a6067c3dd070dfdc7eb655d'
    // } else {
    console.log('starting to upload data to ipfs')
    const ipfsData = pick(formData, TASK_ALL_FORM_FIELDS)
    const dataPath = await uploadTaskDataToIpfs(ipfsData)

    if (email) {
      const userUploadStatus = await addUserToDatabase({
        walletAddress: address,
        email
      })

      if (!userUploadStatus.success && userUploadStatus.error) {
        setState({
          name: CreateTaskState.ErrorCreatingTask,
          error: userUploadStatus.error
        })
        return
      }
    }

    setState({ name: CreateTaskState.PendingUserApproval })
    try {
      const signer = library.getSigner()
      const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(signer, chainId)
      console.log('create options payload for on-chain transaction')
      let options = {}

      if (isNativeChainCurrency(tokenAddress)) {
        tokenAmount = unit.toWei(tokenAmount * 10 ** 18, 'wei').toString()
        options = { value: tokenAmount }
      } else {
        const erc20TokenContract = new ethers.Contract(tokenAddress, erc20ContractAbi, signer)
        // assumes all ERC20 tokens have 18 decimals, this is true for the majority, but not always
        tokenAmount = ethers.utils.parseUnits(tokenAmount, 18)
        const allowance = await (erc20TokenContract.allowance(address, contractAddress))

        let approvalResponse
        if (allowance.isZero()) {
          approvalResponse = await erc20TokenContract.approve(contractAddress, tokenAmount)
        } else {
          approvalResponse = await erc20TokenContract.approve(contractAddress, allowance.add(tokenAmount))
        }
        console.log(approvalResponse)
      }

      options = {
        ...options, ...getDefaultTransactionGasOptions()
      }
      console.log('creating on-chain transaction')
      addTaskTransactionWrite()

      const addTaskTransaction = await taskPortalContract.addTask(ethers.utils.toUtf8Bytes(dataPath), tokenAddress, tokenAmount, options)
      setState({
        name: CreateTaskState.PendingContractTransaction
      })
      console.log('Waiting to add the task on-chain...', addTaskTransaction.hash)
      const res = await addTaskTransaction.wait()
      console.log('Transaction successfully executed:', addTaskTransaction, res)

      const shareEvent = res.events.find(event => event.event === 'NodeUpdated' && event.args.nodeType === NodeType.Share)
      console.log('share event', shareEvent)

      const data = {
        transactionHash: addTaskTransaction.hash,
        taskPath: `${shareEvent.args.parent}`,
        sharePath: `${shareEvent.args.path}`
      }

      analyticsTrackEvent('CreatedTask', { ...data, ...{ chainId } })
      await sleep(1000) // just a random wait, so that the transaction actually shows up in etherscan and share link will work
      // todo: maybe we can trigger a render of the share page in the background, so it's cached already??!?
      setState({
        name: CreateTaskState.DoneCreatingTask,
        data
      })
    } catch (error) {
      console.log(error)
      switch (error.code) {
        case -32602:
          setState({
            name: CreateTaskState.Default,
            message: error.message
          })
          break
        default:
          setState({
            name: CreateTaskState.ErrorCreatingTask,
            error: toString(error)
          })
      }
    }
  }

  function renderUseInfoMessage () {
    return showUserMessage && (<div className="rounded-md bg-blue-50 p-3 mb-4">
      <div className="flex">
        <div className="flex-shrink-0 p-1">
          <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
        </div>
        <div className="ml-2 flex-1 md:flex md:justify-between items-center">
          <p className="text-sm text-blue-700">
            {localState.message}
          </p>
          <p className="mt-3 text-sm md:mt-0 md:ml-6">
            <button
              onClick={() => setShowUserMessage(false)}
              className="bg-white rounded-md p-1 inline-flex items-center justify-center text-gray-400 hover:bg-gray-100 focus:outline-none">
              <span className="sr-only">Close menu</span>
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </p>
        </div>
      </div>
    </div>)
  }

  const renderWalletSwitchCta = () => <button
    type="submit"
    disabled={true}
    className="mt-1 w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-primary"
  >
    Switch to supported chain <ArrowSmUpIcon className="rounded-full w-6 h-6 animate-bounce" />
  </button>

  const renderTaskDescriptionFormPart = () => {
    return <>
      {isConnected && !isSupportedNetwork(chainId) && renderWalletSwitchCta()}
      {isReadyToSubmit && renderWalletAddressInputField(walletAddress)}
      {renderFormField({
        register,
        name: 'email',
        type: 'email',
        required: true,
        label: 'Your Email',
        errors
      })}
      {renderFormField({
        register,
        name: 'title',
        type: 'text',
        required: true,
        label: 'Search Title',
        placeholder: 'A short title of what you are looking for',
        errors
      })}
      {renderFormField({
        register,
        name: 'subtitle',
        type: 'text',
        required: true,
        label: 'Payout Description',
        placeholder: 'Get 1 ETH for doing XYZ'
      })}
      <TaskDescriptionInputField
        register={register}
        watch={watch}
        errorsForField={get(errors, 'description')}
      />
      <TaskAdvancedInputFields
        register={register}
      />
    </>
  }

  const renderTaskBountyFormPart = () => {
    return <>
      <label
        htmlFor="price"
        className="mb-1 block text-md font-medium text-gray-700"
      >
        Bounty Amount
      </label>
      {renderAmountAndCurrencyFormFields({
        register,
        watch,
        nameToTokenAddress,
        tokenAddressToMaxAmount
      })}

      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-md font-medium text-gray-700">Task Preview
          </dt>
          <dd className="mt-1 text-md text-gray-900">
            <MarkdownComponent content={formTaskDescription} />
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-md font-medium text-gray-500">What happens with my bounty?</dt>
          <dd className="mt-1 text-md text-gray-900">
            After submitting your search task the selected token amount will be transferred to a smart contract. It
            works like an escrow over which you have control. You receive a link which you can share with your friends
            to contribute to your search. Entered results/referrals are collected in a dashboard which you can access
            with your wallet. On the dashboard, you can accept or decline results.
          </dd>
        </div>
      </dl>
    </>
  }

  const onNextStepSubmit = async (event) => {
    event.preventDefault()
    const res = await trigger(['email', 'title', 'description'])
    if (res) {
      setState({ name: CreateTaskState.PendingUserInputBounty })
    }
  }

  const renderFormSubmitButton = () => {
    return localState.name === CreateTaskState.PendingUserInputBounty
      ? (<button
        type="submit"
        disabled={!isReadyToSubmit}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none"
      >
        Submit Task & Bounty
      </button>)
      : (<button
        onClick={(event) => onNextStepSubmit(event)}
        disabled={!isReadyToSubmit}
        className={classNames(isReadyToSubmit ? 'hover:bg-primary-light focus:outline-none' : '', 'bg-primary w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white ')}
      >
        Next <ArrowSmRightIcon className="ml-1 mt-px h-5 w-5" />
      </button>)
  }

  const renderBackButton = () => {
    return (<button
      onClick={() => setState({ name: CreateTaskState.Default })}
      className="relative inline-flex items-center px-2 py-2 rounded-sm border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
    >
      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
      <span className="mr-2">Previous</span>
    </button>)
  }

  const renderPageMetaProperties = () => {
    const title = 'Tacit - On-chain tasks, referrals & bounties '
    const description = ''
    const url = getSiteUrl()

    return (<Head>
      <title>{title}</title>
      {/* <link rel="icon" href="/favicon.png" /> */}
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      // base properties
      <meta property="og:site_name" content="Tacit" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" key="ogtitle" content={title} />
      <meta property="og:description" key="ogdesc" content={description} />
      // twitter properties
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content={process.env.SITE} />
      <meta property="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>)
  }

  return (<>
    {renderPageMetaProperties()}
    <div className="px-4 py-8 sm:px-10">
      {localState.message && renderUseInfoMessage()}
      <div className="mt-2">
        <div>
          {localState.name === CreateTaskState.Default && (<label
            htmlFor="walletAddress"
            className="block text-md font-medium text-gray-700"
          >
            Your Wallet Address
          </label>)}
          {!isConnected && (<div className="mt-1 mb-6">
            {renderWalletConnectComponent()}
          </div>)}
        </div>
        <form onSubmit={handleSubmit(addTask)} className="space-y-6">
          {localState.name === CreateTaskState.Default && renderTaskDescriptionFormPart()}
          {localState.name === CreateTaskState.PendingUserInputBounty && renderTaskBountyFormPart()}
          {renderFormSubmitButton()}
          {localState.name === CreateTaskState.PendingUserInputBounty && renderBackButton()}
        </form>
      </div>
    </div>
    <div className="px-4 py-6 bg-gray-50 border-t-2 border-gray-200 sm:px-10">
      <p className="text-xs leading-5 text-gray-500">
        Thank you for being early (🫡, 🫡)
      </p>
    </div>
  </>)
}
