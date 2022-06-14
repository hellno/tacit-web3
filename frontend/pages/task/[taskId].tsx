import { useContext, useEffect, useState } from 'react'
import { CashIcon, CheckCircleIcon } from '@heroicons/react/solid'
import {
  BadgeCheckIcon,
  ClipboardCheckIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  HomeIcon,
  ShareIcon,
  XCircleIcon
} from '@heroicons/react/outline'
import { filter, get, isEmpty, map, sum, truncate } from 'lodash'
import {
  getDefaultTransactionGasOptions,
  getTaskPortalContractInstanceViaActiveWallet,
  loadWeb3Modal
} from '../../src/walletUtils'
import { AppContext } from '../../src/context'
import Web3NavBar from '../../src/components/Web3NavBar'
import LoadingScreenComponent from '../../src/components/LoadingScreenComponent'
import BlockiesComponent from '../../src/components/BlockiesComponent'
import {
  classNames,
  flattenNodesRecursively,
  getBountyAmountWithCurrencyStringFromTaskObject,
  getBountyCurrency
} from '../../src/utils'
// eslint-disable-next-line node/no-missing-import
import { BountyPayoutState, NodeType } from '../../src/const'
import { ethers } from 'ethers'
import ModalComponent from '../../src/components/ModalComponent'
import { useFieldArray, useForm } from 'react-hook-form'

// eslint-disable-next-line no-unused-vars
const mockNodesForDemoVideo = [
  {
    parent: '0xcf5094f5d190baae290bd265adc17816f0559e948b8396208c7fa61d7c7f43e8',
    owner: '0xc8064f04e8C38C9451e10Ff8FA5330904ac97ff7',
    nodeType: 1,
    data: ethers.utils.toUtf8Bytes('Discord: tongm1n#1492'),
    nodes: [],
    isOpen: true,
    taskPath: '0xcf5094f5d190baae290bd265adc17816f0559e948b8396208c7fa61d7c7f43e8'
  },
  {
    parent: '0xcf5094f5d190baae290bd265adc17816f0559e948b8396208c7fa61d7c7f43e8',
    owner: '0xa5030A585B2b1EEd0543F14794443Df552509E11',
    nodeType: 1,
    data: ethers.utils.toUtf8Bytes('Discord: SieFrank#9832'),
    nodes: [],
    isOpen: true,
    taskPath: '0xcf5094f5d190baae290bd265adc17816f0559e948b8396208c7fa61d7c7f43e8'
  },
  {
    parent: '0xcf5094f5d190baae290bd265adc17816f0559e948b8396208c7fa61d7c7f43e8',
    owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    nodeType: 1,
    data: ethers.utils.toUtf8Bytes('by_taltinot#4028'),
    nodes: [],
    isOpen: true,
    taskPath: '0xcf5094f5d190baae290bd265adc17816f0559e948b8396208c7fa61d7c7f43e8'
  },
  {
    parent: '0xcf5094f5d190baae290bd265adc17816f0559e948b8396208c7fa61d7c7f43e8',
    owner: '0x8a155697BEc333861785aC1fC43999BA850160F9',
    nodeType: 1,
    data: ethers.utils.toUtf8Bytes('Telegram: @wfelix82'),
    nodes: [],
    isOpen: true,
    taskPath: '0xcf5094f5d190baae290bd265adc17816f0559e948b8396208c7fa61d7c7f43e8'
  }
]

interface BountyPayoutStateType {
  name: BountyPayoutState,
  data?: object | string
}

export default function TaskPage ({ taskObject }) {
  const [globalState, dispatch] = useContext(AppContext)
  const {
    account,
    library,
    network
  } = globalState

  // eslint-disable-next-line no-unused-vars
  const [bountyPayoutState, setBountyPayoutState] = useState<BountyPayoutStateType>({
    name: BountyPayoutState.Default
  })

  const isLoading = isEmpty(taskObject)
  const isError = !isEmpty(get(taskObject, 'error'))

  const [renderPayoutModal, setRenderPayoutModal] = useState(true)

  const onModalClose = () => {
    setRenderPayoutModal(false)
  }
  const allNodes = isLoading ? [] : flattenNodesRecursively(taskObject.nodes)
  const defaultPayoutFields = isEmpty(allNodes)
    ? []
    : map(allNodes, (node) => ({
      address: node.owner,
      amount: '1'
    })
    )

  const {
    register,
    control,
    handleSubmit,
    watch
  } = useForm({
    defaultValues: { payoutFields: defaultPayoutFields }
  })

  const {
    fields,
    replace
  } = useFieldArray({
    control,
    name: 'payoutFields'
  })

  const formFieldPayoutFields = watch('payoutFields')

  useEffect(() => {
    if (!isEmpty(defaultPayoutFields)) {
      replace(defaultPayoutFields)
    }
  }, [isLoading])

  useEffect(() => {
    loadWeb3Modal(dispatch)
  }, [])

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

  // eslint-disable-next-line no-unused-vars
  const isWalletConnected = !isEmpty(account)
  const bountyCurrency = getBountyCurrency(taskObject)

  // video mock
  // if (taskObject.owner === '0x63b2E4a23240727C2d62b1c91EE76D79E185e2ba') {
  //   allNodes = concat(allNodes, mockNodesForDemoVideo)
  // }

  const cards = [
    {
      name: 'Bounty',
      href: '#',
      icon: CashIcon,
      value: `${getBountyAmountWithCurrencyStringFromTaskObject(taskObject)} for ${allNodes.length - 1} actions`
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

  const renderIconBasedOnNodeType = (nodeType, className) => {
    switch (nodeType) {
      case NodeType.Task:
        return <ClipboardIcon className={className} />
      case NodeType.Share:
        return <ShareIcon className={className} />
      case NodeType.Solution:
        return <ClipboardCheckIcon className={className} />
    }
  }

  const handleTriggerPayoutButton = async (formData) => {
    setBountyPayoutState({ name: BountyPayoutState.Init })

    const signer = library.getSigner()
    const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(signer, network.chainId)
    const addresses = map(formData.payoutFields, (field) => field.address)
    // assumes all ERC20 tokens have 18 decimals, this is true for the majority, but not always
    const amounts = map(formData.payoutFields, (field) => {
      // return parseFloat(field.amount) * 10 ** 18
      return ethers.utils.parseUnits(field.amount, 18)
    })
    setBountyPayoutState({ name: BountyPayoutState.Loading })

    try {
      const payoutTaskTransaction = await taskPortalContract.payoutTask(taskObject.path,
        addresses,
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

  const renderPayoutModalContent = () => {
    const payoutSum = sum(map(formFieldPayoutFields, (field) => parseFloat(field.amount))) || 0
    return (
      <form onSubmit={handleSubmit(handleTriggerPayoutButton)}>
        <ul role="list" className="divide-y divide-gray-200">
          {fields.map((node, index) => (
            <li key={`li-${node.id}`} className="py-2">
              <div className="relative py-2">
                <label htmlFor="name" className="block text-xs font-medium text-gray-900">
                  Address
                </label>
                <div className="flex rounded-sm shadow-sm">
                  <span
                    className="truncate inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-gray-500 sm:text-sm">
                    {truncate(node.address, { length: 28 })}
                  </span>
                  <input
                    {...register(`payoutFields.${index}.amount`, { required: true })}
                    type="text"
                    key={node.id}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300"
                  />
                  <div className="absolute inset-y-0 right-0 pt-3.5 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm" id="bountyCurrency">
                    {bountyCurrency}
                  </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="my-4 sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            {/* <p className="text-sm text-gray-700"> */}
            {/*   awds */}
            {/* </p> */}
          </div>
          <div>
            <p className="text-sm text-gray-700">
              Total payout: {payoutSum} {bountyCurrency}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={!isWalletConnected}
          className={classNames(
            isWalletConnected ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-300',
            'w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white focus:outline-none')}
        >
          Payout bounties
        </button>
      </form>)
  }

  function renderRow (nodeObject) {
    const nodeOwnerStr = nodeObject.owner === taskObject.owner ? 'Creating Task' : nodeObject.owner
    const rowData = ethers.utils.toUtf8String(nodeObject.data)

    return <tr key={`${nodeObject.owner}-${nodeObject.data}`} className="bg-white">
      <td className="max-w-0 w-full px-6 py-4 whitespace-nowrap text-sm text-gray-900 group-hover:text-gray-800">
        <div className="flex">
          <div className="group inline-flex space-x-2 truncate text-sm">
            {renderIconBasedOnNodeType(nodeObject.nodeType, 'flex-shrink-0 h-5 w-5 text-gray-500')}
            <p className="text-gray-500 truncate ">
              {NodeType[nodeObject.nodeType]} by {nodeOwnerStr}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
        <span className="text-gray-900 font-medium">
          {rowData}
        </span>
        {/* {transaction.currency} */}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <p
          className="font-medium capitalize"
        >
          {nodeObject.isOpen ? 'Approved' : 'Rejected'}
        </p>
      </td>
      <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
        <span className="relative z-0 inline-flex shadow-sm rounded-sm">
          <button
            type="button"
            className="relative inline-flex items-center px-4 py-2 rounded-l-sm border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10"
          >
            <span className="sr-only">Approve</span>
            <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        <button
          type="button"
          className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10"
        >
          <span className="sr-only">Reject</span>
          <XCircleIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <a
          href={`https://web3.tacit.so/share/${nodeObject.path}`}
          target="_blank" rel="noopener noreferrer"
          type="button"
          className="-ml-px relative inline-flex items-center px-4 py-2 rounded-r-sm border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10"
        >
          View <ExternalLinkIcon className="ml-1.5 mt-0.5 w-4 h-4 text-gray-600" />
        </a>
        </span>
      </td>
    </tr>
  }

  const renderPageContent = () => {
    return (
      <>
        <div className="mt-8 flex flex-col flex-1">
          <main className="flex-1 pb-8">
            {/* Page header */}
            <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
              <div
                className="bg-white max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:flex md:items-center md:justify-between shadow rounded-sm">
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
                            className="mt-3 flex items-center text-sm text-gray-700 font-medium sm:mr-6 sm:mt-0 capitalize">
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
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-sm text-gray-700 bg-white"
                  >
                    Increase bounty
                    {/* hover:bg-gray-50 */}
                    <span
                      className="ml-2 inline-flex items-center pb-1 pt-0.5 px-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    coming soon
                  </span>
                  </button>
                  <button
                    onClick={() => setRenderPayoutModal(true)}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-sm text-white bg-cyan-600 hover:bg-cyan-700"
                  >
                    Payout bounty 💸
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

              <h2 className="max-w-6xl mx-auto mt-8 px-4 text-lg leading-6 font-medium text-gray-100 sm:px-6 lg:px-8">
                Recent activity
              </h2>
              {/* Activity list (smallest breakpoint only) */}
              <div className="shadow sm:hidden">
                <p className="text-sm font-medium rounded-sm text-gray-700 bg-white">Cannot show actions on mobile
                  yet</p>
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                          <th
                            className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                          <th
                            className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            scope="col"
                          >
                            Actions
                          </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {allNodes.map(renderRow)}
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className="sm:text-center md:max-w-6xl md:mx-auto md:text-left lg:col-span-6 lg:flex lg:items-center">
          <div>
            <h1
              className="text-4xl tracking-tight font-extrabold text-white sm:leading-none lg:text-5xl xl:text-6xl">
              <span className="">
                  {taskObject.title}
                </span>
            </h1>
            {/* <div className="mt-5 text-base text-gray-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl"> */}
            {/*   <ReactMarkdown */}
            {/*     children={taskObject.description} */}
            {/*     remarkPlugins={[remarkGfm]} */}
            {/*     rehypePlugins={[rehypeFormat]} */}
            {/*   /> */}
            {/* </div> */}
          </div>
        </div>
      </div>
    </main>
  }

  return (
    <div className="relative bg-gray-800 overflow-hidden min-h-screen">
      <div className="relative pt-6 pb-16 sm:pb-24">
        <Web3NavBar />
        {renderPayoutModal &&
          <ModalComponent
            renderContent={renderPayoutModalContent}
            titleText="Payout your bounty"
            onClose={onModalClose}
          />}
        {renderTaskPageHeader()}
        {renderPageContent()}
      </div>
    </div>
  )
}

// eslint-disable-next-line no-unused-vars
const exampleTaskPageObject = {
  title: 'LOOKING FOR MONOSPACE DESIGN AGENCY 👀',
  description: 'amazing test description',
  ownerAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  taskData: '0x6261667962656964357872786374326674636435703564776969366a3777766c68786271336c6c34776a77376b6b75637073796f737764326673342f3630393236663165356339313465623936373934616632666665623030353733',
  taskIsOpen: true,
  nodes: [
    {
      parent: '0xcf5094f5d190baae290bd265adc17816f0559e948b8396208c7fa61d7c7f43e8',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      nodeType: 2,
      data: '0x5461736b43726561746f725368617265',
      nodes: [],
      isOpen: true,
      taskPath: '0xcf5094f5d190baae290bd265adc17816f0559e948b8396208c7fa61d7c7f43e8'
    }
  ],
  bountyTokenAddress: '0x0000000000000000000000000000000000000000',
  bountyAmount: '1.0',
  parent: '0xc4088680d754cec005e20dff634159c9ed9804d4cf8f50f410466d1b60be8c4a',
  owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  nodeType: 0,
  data: '0x6261667962656964357872786374326674636435703564776969366a3777766c68786271336c6c34776a77376b6b75637073796f737764326673342f3630393236663165356339313465623936373934616632666665623030353733',
  isOpen: true,
  taskPath: '0x0000000000000000000000000000000000000000000000000000000000000000'
}

export async function getStaticProps ({ params }) {
  const { taskId } = params
  const apiEndpoint = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://web3.tacit.so'
  const apiUrl = `${apiEndpoint}/api/getTaskPageData/${taskId}/`
  console.log('getStaticProps with internal API URL', apiUrl)
  const res = await fetch(apiUrl)
  const taskObject = await res.json()

  // const taskObject = exampleTaskPageObject

  return {
    props: {
      taskObject
    }
    // revalidate: 300 // every 5mins
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
