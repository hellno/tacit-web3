import { useEffect, useState } from 'react'
import { CashIcon, CheckCircleIcon } from '@heroicons/react/solid'
import {
  BadgeCheckIcon,
  ExternalLinkIcon,
  HomeIcon,
  LightBulbIcon,
  PencilIcon,
  PlusCircleIcon,
  ShareIcon,
  SwitchHorizontalIcon
} from '@heroicons/react/outline'
import { constant, filter, findIndex, get, isEmpty, isNil, map, pullAt, times, trim, uniq } from 'lodash'
import {
  getDefaultTransactionGasOptions,
  getTaskPortalContractInstanceViaActiveWallet,
  getTokenAddressToMaxAmounts
} from '../../src/walletUtils'
import Web3NavBar from '../../src/components/Web3NavBar'
import LoadingScreenComponent from '../../src/components/LoadingScreenComponent'
import BlockiesComponent from '../../src/components/BlockiesComponent'
import {
  classNames,
  flattenNodesRecursively,
  getBountyAmountWithCurrencyStringFromTaskObject,
  getSitePathForNode,
  getSiteUrl
} from '../../src/utils'
import { BountyPayoutState, IncreaseBountyState, NodeType } from '../../src/const'
import { ethers } from 'ethers'
import ModalComponent from '../../src/components/ModalComponent'
import { renderAmountAndCurrencyFormFields } from '../../src/formUtils'
import {
  erc20ContractAbi,
  getDeployedContractForChainId,
  getNameToTokenAddressObjectForChainId,
  isNativeChainCurrency
} from '../../src/constDeployedContracts'
import { useForm } from 'react-hook-form'
import PayoutBountyModalComponent from '../../src/components/PayoutBountyModalComponent'
import EditTaskModalComponent from '../../src/components/EditTaskModalComponent'
import TransferTaskModalComponent from '../../src/components/TransferTaskModalComponent'
import { getReadOnlyProviderForChainId } from '../../src/apiUtils'
import { useChainId } from '../../src/useChainId'
import { useAccount, useSigner } from 'wagmi'
import WalletConnectButtonForForm from '../../src/components/WalletConnectButtonForForm'
import { getUserInfoFromDatabase } from '../../src/supabase'
import Head from 'next/head'

const unit = require('ethjs-unit')

interface BountyPayoutStateType {
  name: BountyPayoutState,
  data?: object | string
}

interface IncreaseBountyStateType {
  name: IncreaseBountyState,
  data?: object | string
}

interface IContractNode {
  data: string,
  path: string,
  taskPath: string,
  owner: string,
  parent: string,
  nodeType: NodeType,
  isOpen: boolean,
  nodes: Array<object>
}

export default function TaskPage ({ taskObject }) {
  const [bountyPayoutState, setBountyPayoutState] = useState<BountyPayoutStateType>({
    name: BountyPayoutState.Default
  })

  const [increaseBountyState, setIncreaseBountyState] = useState<IncreaseBountyStateType>({
    name: IncreaseBountyState.Default
  })

  const [walletAddressToUserInfo, setWalletAddressToUserInfo] = useState<any>({})

  const isLoading = isEmpty(taskObject)
  const isError = !isEmpty(get(taskObject, 'error'))

  const {
    address,
    isConnected
  } = useAccount()
  const chainId = useChainId()
  const { data: signer } = useSigner()

  const [nameToTokenAddress, setNameToTokenAddress] = useState({})
  const [tokenAddressToMaxAmount, setTokenAddressToMaxAmount] = useState({})
  const [renderPayoutModal, setRenderPayoutModal] = useState(false)
  const [renderIncreaseBountyModal, setRenderIncreaseBountyModal] = useState(false)
  const [renderEditTaskModal, setRenderEditTaskModal] = useState(false)
  const [renderTransferTaskModal, setRenderTransferTaskModal] = useState(false)

  // @ts-ignore
  useEffect(async () => {
    if (chainId) {
      const nameToTokenAddr = getNameToTokenAddressObjectForChainId(chainId)
      setNameToTokenAddress(nameToTokenAddr)
      const provider = getReadOnlyProviderForChainId(chainId)
      setTokenAddressToMaxAmount(await getTokenAddressToMaxAmounts(nameToTokenAddr, provider, address))
    }
  }, [chainId])

  const onClosePayoutModal = () => {
    setRenderPayoutModal(false)
  }

  const onCloseIncreaseBountyModal = () => {
    setRenderIncreaseBountyModal(false)
  }

  const onCloseEditTaskModal = () => {
    setRenderEditTaskModal(false)
  }

  let allNodes: Array<IContractNode> = !isLoading && !isEmpty(taskObject.nodes) ? flattenNodesRecursively(taskObject.nodes) : []
  allNodes = map(allNodes,
    (node) => {
      return {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...node, ...{ data: trim(ethers.utils.toUtf8String(node.data), '"') }
      }
    })

  const taskCreationShareIndex = findIndex(allNodes, ({ data }) => data === 'TaskCreatorShare')
  const [taskCreationNode]: Array<IContractNode> = pullAt(allNodes, taskCreationShareIndex)
  const hasContentForTable = !isEmpty(allNodes)
  const walletAddresses = uniq(map(allNodes, 'owner'))

  // @ts-ignore
  useEffect(async () => {
    if (!isEmpty(walletAddresses) && isEmpty(walletAddressToUserInfo)) {
      const {
        success,
        data
      } = await getUserInfoFromDatabase(walletAddresses)
      if (success && data) {
        setWalletAddressToUserInfo(data)
      }
    }
  }, [isLoading])

  const {
    register,
    watch,
    handleSubmit
  } = useForm()

  const renderLoadingScreen = () => (
    <LoadingScreenComponent subtitle={'Fetching on-chain data and task details from IPFS'} />
  )

  const renderErrorScreen = () => (
    <div className="mt-8"><h1 className="text-center text-4xl font-bold">Error {taskObject.error}</h1></div>
  )

  if (isLoading) {
    return renderLoadingScreen()
  }

  if (isError) {
    return renderErrorScreen()
  }

  const isUserOnCorrectChain = taskObject && address && taskObject.chainId === chainId

  const cards = [
    {
      name: taskObject.bounties.length > 1 ? 'Bounties' : 'Bounty',
      href: '#',
      icon: CashIcon,
      value: map(taskObject.bounties, (bounty, idx) =>
        <p key={`bounty-${idx}`}>
          {getBountyAmountWithCurrencyStringFromTaskObject(bounty, taskObject.chainId)}
        </p>
      )
    },
    {
      name: 'Shares',
      href: '#',
      icon: ShareIcon,
      value: filter(allNodes, (node) => node.nodeType === NodeType.Share).length
    },
    {
      name: 'Accepted Solutions',
      href: '#',
      icon: BadgeCheckIcon,
      value: filter(allNodes, (node) => node.nodeType === NodeType.Solution).length
    }
  ]

  const {
    contractAddress,
    blockExplorer
  } = getDeployedContractForChainId(taskObject.chainId)

  const handleTriggerIncreaseBountyButton = async (formData) => {
    let {
      tokenAddress,
      tokenAmount
    } = formData
    setIncreaseBountyState({ name: IncreaseBountyState.Init })
    try {
      const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(signer, chainId)
      console.log('create options payload for on-chain transaction', taskPortalContract)
      let options = {}

      if (isNativeChainCurrency(tokenAddress)) {
        tokenAmount = unit.toWei(tokenAmount * 10 ** 18, 'wei').toString()
        options = { value: tokenAmount }
      } else {
        // @ts-ignore
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
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...options, // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...getDefaultTransactionGasOptions()
      }
      console.log('creating on-chain transaction')
      const increaseBountyTransaction = await taskPortalContract.increaseBounty(taskObject.path, tokenAddress, tokenAmount, options)
      setIncreaseBountyState({
        name: IncreaseBountyState.Loading
      })
      console.log('Waiting to increase the bounty on-chain...', increaseBountyTransaction.hash)
      const res = await increaseBountyTransaction.wait()
      console.log('Transaction successfully executed:', increaseBountyTransaction, res)
      setIncreaseBountyState({ name: IncreaseBountyState.Success })
    } catch (error) {
      console.log('error when increasing bounty', error)
      setIncreaseBountyState({
        name: IncreaseBountyState.Error
      })
    }
  }

  const handleTriggerPayoutButton = async (formData) => {
    setBountyPayoutState({ name: BountyPayoutState.Init })

    const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(signer, chainId)
    const addresses = map(formData.payoutFields, (field) => field.address)
    // assumes all payouts are in same token that first bounty is given in
    const tokenAddresses = times(formData.payoutFields.length, constant(taskObject.bounties[0].tokenAddress))
    const payoutFields = filter(formData.payoutFields, (field) => !(isNil(field.tokenAmount) || field.tokenAmount === '0' || field.tokenAmount === ''))

    const amounts = map(payoutFields, (field) => {
      // assumes all ERC20 tokens have 18 decimals, this is true for the majority, but not always
      return ethers.utils.parseUnits(field.tokenAmount, 18)
    })
    setBountyPayoutState({
      name: BountyPayoutState.Loading,
      data: { payoutFields }
    })

    try {
      const payoutTaskTransaction = await taskPortalContract.payoutTask(taskObject.path,
        addresses,
        tokenAddresses,
        amounts,
        getDefaultTransactionGasOptions()
      )

      const res = await payoutTaskTransaction.wait()
      console.log('Transaction successfully executed:', payoutTaskTransaction, res)
      setBountyPayoutState({ name: BountyPayoutState.Success })
    } catch (e) {
      console.log('caught error ', e)

      setBountyPayoutState({
        name: BountyPayoutState.Error,
        data: e.toString()
      })
    }
  }

  const renderIncreaseBountyModalContent = () => {
    switch (increaseBountyState.name) {
      case IncreaseBountyState.Default:
      case IncreaseBountyState.Init:
      case IncreaseBountyState.Loading:
        return <div>
          <form onSubmit={handleSubmit(handleTriggerIncreaseBountyButton)}>
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
            <button
              type="submit"
              disabled={!isConnected}
              className={classNames(
                isConnected ? 'bg-primary hover:bg-primary-light' : 'bg-gray-300',
                'mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white focus:outline-none')}
            >
              Increase bounty
            </button>
          </form>
        </div>
      case IncreaseBountyState.Error:
        return <div>Error, you should not see this 🥲</div>
      case IncreaseBountyState.Success:
        return <div>
          <p className="text-sm text-gray-700">
            🎉 Success 🥳<br />You increased the bounty
          </p>
        </div>
      default:
        return <div></div>
    }
  }

  const renderEmptyState = () => {
    return (
      <tr key="empty-state" className="bg-white">
        <td
          className="flex md:justify-center whitespace-nowrap text-sm text-gray-900">
          <div className="px-12 py-8 group inline-flex">
            <div
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center"
            >
              <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-500">User activity will show up here</span>
            </div>
          </div>
        </td>
      </tr>
    )
  }

  const nodeTypeToStringDescription = (nodeType) => {
    switch (nodeType) {
      case NodeType.Share:
        return 'Shared by'
      case NodeType.Solution:
        return 'Submitted by'
    }
  }

  function renderRow (nodeObject) {
    const rowData = nodeObject.data
    // const isShareNode = NodeType[nodeObject.nodeType] === 'Share'
    //
    // const viewShareLink = () => {
    //   return (<a
    //     href={`${getSiteUrl()}/${getSitePathForNode({
    //       nodeType: 'share',
    //       chainId: taskObject.chainId,
    //       path: nodeObject.path
    //     })}`}
    //     target="_blank" rel="noopener noreferrer"
    //     type="button"
    //     className="-ml-px relative inline-flex items-center px-4 py-2 rounded-r-sm border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10"
    //   >
    //     View <ExternalLinkIcon className="ml-1.5 mt-0.5 w-4 h-4 text-gray-600" />
    //   </a>)
    // }

    return <tr key={`${nodeObject.owner}-${nodeObject.path}`} className="bg-white">
      <td className="max-w-sm px-6 py-4 whitespace-nowrap text-sm text-gray-900 group-hover:text-gray-800">
        <div className="flex">
          <div className="group relative flex-col">
            <p className="text-gray-600">
              <a target="_blank" rel="noopener noreferrer"
                 href={`${blockExplorer}/address/${nodeObject.owner}`}>
                {nodeTypeToStringDescription(nodeObject.nodeType)} by {get(walletAddressToUserInfo, nodeObject.owner, nodeObject.owner)}
              </a>
            </p>
          </div>
        </div>
      </td>
      <td className="max-w-sm px-6 py-4 text-right text-sm text-gray-500">
        <div className="text-gray-900 font-medium text-left break-words ">
          {map(rowData.split('\\n'), (item, idx) => (
            <span key={`row-data-${idx}`}>
                {item}
              <br />
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <p
          className="font-medium capitalize"
        >
          {nodeObject.isOpen ? 'Approved' : 'Rejected'}
        </p>
      </td>
      {/* <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500"> */}
      {/*   <span className="relative z-0 inline-flex shadow-sm rounded-sm"> */}
      {/*     {isShareNode ? viewShareLink() : <p className="-ml-2 mr-24" />} */}
      {/* {!nodeObject.isOpen */}
      {/*   ? (<button */}
      {/*     type="button" */}
      {/*     className="relative inline-flex items-center px-4 py-2 rounded-l-sm border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10" */}
      {/*   > */}
      {/*     <span className="sr-only">Approve</span> */}
      {/*     <CheckCircleIcon className="h-5 w-5" aria-hidden="true" /> */}
      {/*   </button>) */}
      {/*   : (<button */}
      {/*     type="button" */}
      {/*     className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10" */}
      {/*   > */}
      {/*     <span className="sr-only">Reject</span> */}
      {/*     <XCircleIcon className="h-5 w-5" aria-hidden="true" /> */}
      {/*   </button>)} */}
      {/*   </span> */}
      {/* </td> */}
    </tr>
  }

  const renderPageContent = () => {
    return (
      <>
        <div className="mt-8 flex flex-col flex-1">
          <main className="flex-1 pb-8">
            {/* Page header */}
            <div className="px-4 mx-auto max-w-screen-xl sm:px-6 lg:px-8">
              <div
                className="bg-white max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:flex md:items-center md:justify-between shadow rounded-sm">
                <div className="flex-1 min-w-0">
                  {/* Profile */}
                  <div className="flex items-center ">
                    <div className="hidden h-12 w-12 rounded-full sm:block">
                      <BlockiesComponent
                        opts={{
                          seed: taskObject.ownerAddress,
                          color: '#dfe'
                          // size: 15
                          // scale: 3,
                        }} />
                    </div>
                    <div className="ml-2 flex items-center">
                      <div>
                        <h1
                          className="ml-3 mb-1 text-xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                          gm 👋🏼
                          {/* {taskObject.ownerAddress} */}
                        </h1>
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
                            className="mt-3 flex items-center text-sm text-gray-700 font-medium sm:mr-6 sm:mt-0 capitalize">
                            <CheckCircleIcon
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"
                              aria-hidden="true"
                            />
                            Verified account
                          </dd>
                          <dd
                            className="mt-3 flex items-center text-sm text-gray-700 font-medium sm:mr-6 sm:mt-1 capitalize">
                            <HomeIcon
                              className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"
                              aria-hidden="true"
                            />
                            Thank you for being here
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
                  {isUserOnCorrectChain
                    ? <>
                      <a href={`${getSiteUrl()}/${getSitePathForNode({
                        nodeType: 'share',
                        chainId: taskObject.chainId,
                        path: taskCreationNode.path
                      })}`}
                         target="_blank" rel="noopener noreferrer"
                         type="button"
                         className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ExternalLinkIcon className="-ml-1 mr-2 h-4 w-4 text-gray-400" aria-hidden="true" />
                        Share
                      </a>
                      <button
                        type="button"
                        onClick={() => setRenderEditTaskModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PencilIcon className="-ml-1 mr-2 h-4 w-4 text-gray-400" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenderTransferTaskModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <SwitchHorizontalIcon className="-ml-1 mr-2 h-4 w-4 text-gray-400" aria-hidden="true" />
                        Transfer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenderIncreaseBountyModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PlusCircleIcon className="-ml-1 mr-2 h-4 w-4 text-gray-400" aria-hidden="true" />
                        Increase bounty
                      </button>
                      <button
                        onClick={() => setRenderPayoutModal(true)}
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-sm text-white bg-secondary hover:bg-secondary-light"
                      >
                        Payout bounty
                      </button>
                    </>
                    : isConnected && <WalletConnectButtonForForm requiredChainId={taskObject.chainId} />
                    //   <button
                    //   onClick={() => switchNetwork(provider, taskObject.chainId).then(() => window.location.reload())}
                    //   type="button"
                    //   className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-sm text-white bg-secondary hover:bg-secondary-light"
                    // >
                    //   Switch to {getDeployedContractForChainId(taskObject.chainId).name}
                    // </button>
                  }
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-lg leading-6 font-medium text-gray-100">Overview</h2>
                <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Card */}
                  {cards.map((card) => (
                    <div key={card.name} className="bg-white overflow-hidden shadow rounded-sm">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <card.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                              <dd>
                                <div className="text-lg font-medium text-gray-900">{card.value}</div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      {/* <div className="bg-gray-50 px-5 py-3"> */}
                      {/*   <div className="text-sm"> */}
                      {/*     <a href={card.href} className="font-medium text-cyan-700 hover:text-cyan-900"> */}
                      {/*       View all */}
                      {/*     </a> */}
                      {/*   </div> */}
                      {/* </div> */}
                    </div>
                  ))}
                </div>
              </div>

              <h2
                className="max-w-screen-xl mx-auto mt-8 px-4 text-lg leading-6 font-medium text-gray-100 sm:px-6 lg:px-8">
                Recent activity
              </h2>
              {/* Activity list (smallest breakpoint only) */}
              <div className="shadow sm:hidden">
                <p className="text-sm font-medium rounded-sm text-gray-700 bg-white">
                  Cannot show actions on mobile yet
                </p>
                {/* <ul role="list" className="mt-2 divide-y divide-gray-200 overflow-hidden shadow sm:hidden"> */}
                {/*   {transactions.map(renderRow)} */}
                {/* </ul> */}
                {/* <nav */}
                {/*   className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200" */}
                {/*   aria-label="Pagination" */}
                {/* > */}
                {/*   <div className="flex-1 flex justify-between"> */}
                {/*     <a */}
                {/*       href="#" */}
                {/*       className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-sm text-gray-700 bg-white hover:text-gray-500" */}
                {/*     > */}
                {/*       Previous */}
                {/*     </a> */}
                {/*     <a */}
                {/*       href="#" */}
                {/*       className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-sm text-gray-700 bg-white hover:text-gray-500" */}
                {/*     > */}
                {/*       Next */}
                {/*     </a> */}
                {/*   </div> */}
                {/* </nav> */}
              </div>

              {/* Activity table (small breakpoint and up) */}
              <div className="hidden sm:block">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col mt-2">
                    <div className="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                        <tr>
                          <th
                            className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Transaction
                          </th>
                          {hasContentForTable && (<>
                              <th
                                className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                scope="col"
                              >
                                Data
                              </th>
                              <th
                                className="hidden px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:block"
                                scope="col"
                              >
                                Status
                              </th>
                              {/* <th */}
                              {/*   className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" */}
                              {/*   scope="col" */}
                              {/* > */}
                              {/*   Actions */}
                              {/* </th> */}
                            </>
                          )}
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {hasContentForTable ? allNodes.map(renderRow) : renderEmptyState()}
                        </tbody>
                      </table>
                      {/* Pagination */}
                      {/* <nav */}
                      {/*   className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6" */}
                      {/*   aria-label="Pagination" */}
                      {/* > */}
                      {/*   <div className="hidden sm:block"> */}
                      {/*     <p className="text-sm text-gray-700"> */}
                      {/*       Showing <span className="font-medium">1</span> to <span */}
                      {/*       className="font-medium">10</span> of{' '} */}
                      {/*       <span className="font-medium">20</span> results */}
                      {/*     </p> */}
                      {/*   </div> */}
                      {/*   <div className="flex-1 flex justify-between sm:justify-end"> */}
                      {/*     <a */}
                      {/*       href="#" */}
                      {/*       className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50" */}
                      {/*     > */}
                      {/*       Previous */}
                      {/*     </a> */}
                      {/*     <a */}
                      {/*       href="#" */}
                      {/*       className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50" */}
                      {/*     > */}
                      {/*       Next */}
                      {/*     </a> */}
                      {/*   </div> */}
                      {/* </nav> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    )
  }

  function renderTaskPageHeader () {
    if (isEmpty(taskObject)) {
      return <></>
    }
    return <main className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div
          className="sm:text-center md:max-w-6xl md:mx-auto md:text-left lg:col-span-6 lg:flex lg:items-center">
          <div>
            <h1
              className="text-4xl tracking-tight font-extrabold text-white sm:leading-none lg:text-5xl xl:text-6xl">
              <span className="">
                  {taskObject.title}
                </span>
            </h1>
          </div>
        </div>
      </div>
    </main>
  }

  const renderPageMetaProperties = () => {
    const title = 'Tacit Dashboard - ' + taskObject.title
    const url = getSiteUrl()

    return (
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        // base properties
        <meta property="og:site_name" content="Tacit" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" key="ogtitle" content={title} />
      </Head>
    )
  }

  return (
    <>
      {renderPageMetaProperties()}
      <div className="relative bg-background overflow-hidden min-h-screen">
        <div className="relative pt-6 pb-16 sm:pb-24">
          <Web3NavBar />
          {renderPayoutModal &&
            <PayoutBountyModalComponent
              state={bountyPayoutState}
              taskObject={taskObject}
              allNodes={allNodes}
              onSubmit={handleTriggerPayoutButton}
              onClose={onClosePayoutModal}
            />}
          {renderIncreaseBountyModal &&
            <ModalComponent
              renderContent={renderIncreaseBountyModalContent}
              titleText="Increase the bounty for this task"
              onClose={onCloseIncreaseBountyModal}
            />}
          {renderEditTaskModal &&
            <EditTaskModalComponent
              taskObject={taskObject}
              onClose={onCloseEditTaskModal}
            />}
          {renderTransferTaskModal &&
            <TransferTaskModalComponent
              taskObject={taskObject}
              onClose={onCloseEditTaskModal}
            />}
          {renderTaskPageHeader()}
          {renderPageContent()}
        </div>
      </div>
    </>
  )
}

// eslint-disable-next-line no-unused-vars
const exampleTaskPageObject = {
  title: 'Looking for a DevOps/Backend engineer for Cent.co!',
  subtitle: 'We\'ll pay 0.25 ETH for finding a DevOps/Backend engineer',
  description: 'We\'re looking for a DevOps/Backend engineer who can help us scale up Cent and support our Products and Services with the Infrastructure it needs to support billions of people.\n&nbsp;\n**You can earn 0.25 ETH for referring that special someone.**\n&nbsp;\nIf you don’t know anyone personally, but do know someone that might, you can share your own referral link with them and can both get rewarded.\n&nbsp;\nQualified candidates will have held Senior Engineering roles at other tech companies. They will have the ability to plan changes in coordination with product + engineering teams and execute those projects. As we scale the team, individual contributor responsibilities will expand to include coordinating / delegating engineering work to other engineers as well.\n&nbsp;\nRequired:\n- Experience working with Terraform, NodeJS, SQL,  AWS CodePipeline / Lambda / ECS / RDS / CloudFront / Route53\n- Interest in blockchain-based applications\nBonus:\n- Familiarity with Solidity / Smart Contracts / Digital Assets (NFTs)',
  ctaSolution: 'Refer someone!',
  subtitleSolutionModal: 'Refer someone',
  ownerAddress: '0x4133c79E575591b6c380c233FFFB47a13348DE86',
  taskData: '0x6261667962656965753572786a6962747077366967767079346834776e7476793776376368766d693666357679696d64636a36356c7867687767342f6435333636643661343733376331396439616565333432633936303034633162',
  taskIsOpen: true,
  nodes: [{
    parent: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
    owner: '0x4133c79E575591b6c380c233FFFB47a13348DE86',
    nodeType: 2,
    data: '0x5461736b43726561746f725368617265',
    nodes: [{
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0x4133c79E575591b6c380c233FFFB47a13348DE86',
      nodeType: 2,
      data: '0x20',
      nodes: [],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0x0a467975e497fcaf5ce214d0ddd3a363a57c7a38b9c9ae52ab7cf205fb0f862a'
    }, {
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0xce9D0fCe9560D8ee4B3fD9A2291635AE9843aEA5',
      nodeType: 2,
      data: '0x20',
      nodes: [{
        parent: '0x06b29f5f6be18dc0fe2f64d436f342501413fa860a826ea50e17bf247436b42a',
        owner: '0xce9D0fCe9560D8ee4B3fD9A2291635AE9843aEA5',
        nodeType: 2,
        data: '0x20',
        nodes: [{
          parent: '0x66c03f1a623cf22fdd6bb64ad21f73168a0b12c8cf098a351a049634fe2f5b13',
          owner: '0xce9D0fCe9560D8ee4B3fD9A2291635AE9843aEA5',
          nodeType: 2,
          data: '0x20',
          nodes: [],
          isOpen: true,
          taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
          path: '0xcc0398571cda7e96c1eb0453e2af0aa1250f119a38070f5d27af9720d929535b'
        }],
        isOpen: true,
        taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
        path: '0x66c03f1a623cf22fdd6bb64ad21f73168a0b12c8cf098a351a049634fe2f5b13'
      }],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0x06b29f5f6be18dc0fe2f64d436f342501413fa860a826ea50e17bf247436b42a'
    }, {
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0xedD5254b5708c35109763ED41dD1E308e234e363',
      nodeType: 1,
      data: '0x224920616d2061207665727920637572696f7573205370616e69736820776f6d616e2077686f207365656b7320636f6e7374616e7420706572736f6e616c2067726f7774682e2043656e742069732061207061676520746861742062657473206f6e2061727420616e642077686572652065766572796f6e6520686173206120706c6163652e20497420697320776f7274682073746f7070696e6720616e6420646973636f766572696e672065766572797468696e67206974206272696e67732e22',
      nodes: [],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0x81ffb2521247fc6bb6ad656f82b6f7f089bf67a13c13a3137a2647f9a70085ad'
    }, {
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0xedD5254b5708c35109763ED41dD1E308e234e363',
      nodeType: 2,
      data: '0x20',
      nodes: [],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0x7264501b25e4efb07c8ad8e2c95d38be3c5a90351e00d3671d6b884684dff13d'
    }, {
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0x4b642761A9047b17570E2E66C9Ff335C806cF8a4',
      nodeType: 1,
      data: '0x22526566657220736f6d656f6e6522',
      nodes: [],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0xce5ad1bad90548334e8c9ca0771444daf2e88379084fbde707dbaf24145b126a'
    }, {
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0x4b642761A9047b17570E2E66C9Ff335C806cF8a4',
      nodeType: 1,
      data: '0x22526566657220736f6d656f6e6522',
      nodes: [],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0x5ad79eba665767235b6f85eeb53f777e5834bc922ab07f085f9a173dd1e094ba'
    }, {
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0x4b642761A9047b17570E2E66C9Ff335C806cF8a4',
      nodeType: 2,
      data: '0x20',
      nodes: [],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0xbaa07096b1782015cf5250bccc381c716ef7c4afe1e87cc8d716b7e559fbf918'
    }, {
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0x4b642761A9047b17570E2E66C9Ff335C806cF8a4',
      nodeType: 1,
      data: '0x2268747470733a2f2f776562332e74616369742e736f2f73686172652f6d617469633a30786261613037303936623137383230313563663532353062636363333831633731366566376334616665316538376363386437313662376535353966626639313822',
      nodes: [],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0x8720cfc791c8a2bf3a367bba8efb60736bc2bf06bb3cb874dc4ce4c886e2bc48'
    }, {
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0x4b642761A9047b17570E2E66C9Ff335C806cF8a4',
      nodeType: 2,
      data: '0x20',
      nodes: [],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0xca4235d4a7c21bd941db196d4b30695e03c7c802e8529c0827212954bcd27181'
    }, {
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0xde1ceE777E5bB1d0e1eBb0146D9D34d6adB764Fa',
      nodeType: 2,
      data: '0x20',
      nodes: [{
        parent: '0x88974cf138af7a6acb8bbe3f03a68e474c1a8718f652816df8dcd11127980436',
        owner: '0xde1ceE777E5bB1d0e1eBb0146D9D34d6adB764Fa',
        nodeType: 2,
        data: '0x20',
        nodes: [],
        isOpen: true,
        taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
        path: '0x95f1847d7411e9fe0652496ca31dec9945f5354ab083457593a1581ff6f58802'
      }],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0x88974cf138af7a6acb8bbe3f03a68e474c1a8718f652816df8dcd11127980436'
    }, {
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0xe119897408616938a0dc7B1f3596beeDD34e0869',
      nodeType: 2,
      data: '0x20',
      nodes: [],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0x11540953757877d805c4d3d6a0a6c710c4721cc86b5cfad494da97fe184b480b'
    }, {
      parent: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b',
      owner: '0xe119897408616938a0dc7B1f3596beeDD34e0869',
      nodeType: 1,
      data: '0x224d6f6e696b20706174656c2c206261636b656e6420646576656c6f70657220696e20707974686f6e206c616e67756167652e22',
      nodes: [],
      isOpen: true,
      taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
      path: '0xa0159726f317010a4ba82ba2a859beba8b5d6a8db5abe896b01023fdc4f16699'
    }],
    isOpen: true,
    taskPath: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
    path: '0x7df8a4249d2f846b1172de7ecaf0a14d5a292ea8243ec3a90f50c433835a309b'
  }],
  bounties: [{
    tokenAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    amount: '0.25'
  }],
  parent: '0x7f984977d43a0ef4f27491baf2e474e5aff55e5f73adb569a75e43a517fcb5e3',
  owner: '0x4133c79E575591b6c380c233FFFB47a13348DE86',
  nodeType: 0,
  data: '0x6261667962656965753572786a6962747077366967767079346834776e7476793776376368766d693666357679696d64636a36356c7867687767342f6435333636643661343733376331396439616565333432633936303034633162',
  isOpen: true,
  taskPath: '0x0000000000000000000000000000000000000000000000000000000000000000',
  path: '0xe92c904c58932105d9002a1a521355e4fa8204a7d922720bfef10ec53eb099c6',
  chainId: 137
}

export async function getStaticProps ({ params }) {
  const { taskId } = params
  const apiEndpoint = getSiteUrl()
  const apiUrl = `${apiEndpoint}/api/getTaskPageData/${taskId}/`
  const res = await fetch(apiUrl)
  const taskObject = await res.json()
  // const taskObject = exampleTaskPageObject
  return {
    props: {
      taskObject
    }
    // revalidate: 10 // every 10 secs
  }
}

export async function getStaticPaths () {
  // can add some paths by reading from tasks in smart contract on-chain later
  const paths = []

  // fallback: true means that the missing pages
  // will not 404, and instead can render a fallback.
  return {
    paths,
    fallback: true
  }
}
