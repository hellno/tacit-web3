import { useEffect, useState } from 'react'
import { ArrowSmRightIcon, ArrowSmUpIcon, ChevronLeftIcon, InformationCircleIcon } from '@heroicons/react/solid'
import { useForm } from 'react-hook-form'
// eslint-disable-next-line node/no-missing-import
import { getTokenAddressToMaxAmounts, useMainnetEnsName } from '../walletUtils'
import { renderAmountAndCurrencyFormFields, renderFormField, renderWalletAddressInputField } from '../formUtils'
import { get, pick } from 'lodash'
import {
  getNameToTokenAddressObjectForChainId,
  isSupportedNetwork,
  NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT
} from '../constDeployedContracts'
import { classNames, getSiteUrl, isDevEnv, sleep } from '../utils'
import { XIcon } from '@heroicons/react/outline'
import TaskDescriptionInputField from './TaskDescriptionInputField'
// eslint-disable-next-line node/no-missing-import
import TaskAdvancedInputFields from './TaskAdvancedInputFields'
import Head from 'next/head'
import { getReadOnlyProviderForChainId } from '../apiUtils'
import { useAccount } from 'wagmi'
// eslint-disable-next-line node/no-missing-import
import { useChainId } from '../useChainId'
// eslint-disable-next-line node/no-missing-import
import { CreateTaskState, TASK_ALL_FORM_FIELDS } from '../const'
import { uploadTaskDataToIpfs } from '../storageUtils'
// eslint-disable-next-line node/no-missing-import
import WalletConnectButtonForForm from './WalletConnectButtonForForm'

export default function CreateTaskFormComponent ({
  state: localState,
  setState
}) {
  const {
    address,
    isConnected
  } = useAccount()
  const chainId = useChainId()

  const [nameToTokenAddress, setNameToTokenAddress] = useState({})
  const [tokenAddressToMaxAmount, setTokenAddressToMaxAmount] = useState({})
  const [showUserMessage, setShowUserMessage] = useState(true)
  const isReadyToSubmit = isConnected && isSupportedNetwork(chainId)
  const ensName = useMainnetEnsName(address)
  const walletAddress = ensName || address
  const currState = localState.name

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
      tokenAmount: 0.001,
      tokenAddress: NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT
    }
  })

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
      setState({ name: CreateTaskState.PendingUserBountyInput })
    }
  }

  const renderFormSubmitButton = () => {
    return currState === CreateTaskState.PendingUserBountyInput
      ? <button
        disabled={!isConnected}
        type="submit"
        className={classNames(isConnected && 'hover:bg-primary-light', 'w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-primary focus:outline-none')}
      >
        Next <ArrowSmRightIcon className="ml-1 mt-px h-5 w-5" />
        {/* Submit Task & Bounty */}
      </button>
      : <button
        onClick={(event) => onNextStepSubmit(event)}
        disabled={!isConnected}
        className={classNames(isReadyToSubmit ? 'hover:bg-primary-light focus:outline-none' : '', 'bg-primary w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white ')}
      >
        Next <ArrowSmRightIcon className="ml-1 mt-px h-5 w-5" />
      </button>
  }

  const renderBackButton = () => {
    return (<button
      onClick={() => setState({ name: CreateTaskState.PendingUserTaskInput })}
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

  const handleFormSubmit = async (formData) => {
    setState({
      name: CreateTaskState.PendingUploadToIpfs,
      data: formData
    })

    const ipfsData = pick(formData, TASK_ALL_FORM_FIELDS)
    const ipfsDataPath = await uploadTaskDataToIpfs(ipfsData)
    // const ipfsDataPath = 'bafybeibqz6l4ecvpra6wej4v2keh7piz2d3jnzscfoitfmzuwetqcev6yu/15f546c50814d66380f7c89e9d2704f0'
    await sleep(1000)

    setState({
      name: CreateTaskState.PendingUserOnChainApproval,
      data: { ...formData, ...{ ipfsDataPath } }
    })
  }

  const renderPendingUpload = () => {
    return <p className="text-sm text-gray-500 animate-pulse">
      Uploading your task data to IPFS...
    </p>
  }

  return (<>
    {renderPageMetaProperties()}
    <div className="px-4 py-8 sm:px-10">
      {localState.message && renderUseInfoMessage()}
      <div className="mt-2">
        {currState === CreateTaskState.PendingUserTaskInput && (<label
          htmlFor="walletAddress"
          className="block text-md font-medium text-gray-700"
        >
          Your Wallet Address
        </label>)}
        {!isConnected && (<div className="mt-1 mb-6">
          <WalletConnectButtonForForm />
        </div>)}
        <form
          className="space-y-6"
          onSubmit={handleSubmit((formData) => handleFormSubmit(formData))}
        >
          {currState === CreateTaskState.PendingUserTaskInput && renderTaskDescriptionFormPart()}
          {currState === CreateTaskState.PendingUserBountyInput && renderTaskBountyFormPart()}
          {currState !== CreateTaskState.PendingUploadToIpfs && renderFormSubmitButton()}
          {currState === CreateTaskState.PendingUserBountyInput && renderBackButton()}
          {currState === CreateTaskState.PendingUploadToIpfs && renderPendingUpload()}
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
