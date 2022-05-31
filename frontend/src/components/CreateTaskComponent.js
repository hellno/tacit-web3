import { useContext, useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/solid'

import { ethers } from 'ethers'
import { useForm } from 'react-hook-form'
import {
  getDefaultTransactionGasOptions,
  getTaskPortalContractInstanceViaActiveWallet,
  renderWalletConnectComponent
} from '../walletUtils'
import { AppContext } from '../context'
import { renderFormField, renderWalletAddressInputField } from '../formUtils'
import { isEmpty, map } from 'lodash'
import { generateHashForObject, storeObjectInIPFS } from '../storageUtils'
import {
  erc20ContractAbi,
  getDeployedContractForChainId,
  isEthBounty,
  nameToTokenAddress
} from '../constDeployedContracts'
// eslint-disable-next-line node/no-missing-import
import { NodeType } from '../const'
import { sleep } from '../utils'
import { XIcon } from '@heroicons/react/outline'

const unit = require('ethjs-unit')

const CreateTaskState = require('../const.ts').CreateTaskState

export default function CreateTaskComponent ({
  state: localState,
  setState
}) {
  const [globalState, dispatch] = useContext(AppContext)
  const {
    web3Modal,
    account,
    library,
    network
  } = globalState

  const [showUserMessage, setShowUserMessage] = useState(true)
  const isWalletConnected = !isEmpty(account)

  const {
    register,
    handleSubmit
  } = useForm({
    defaultValues: {
      email: 'test@test.com',
      title: 'this is a sweet test title',
      description: 'amazing test description',
      tokenAmount: '2',
      tokenAddress: '0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc'
    }
  })

  const handleFormSubmit = (formData) => {
    addTask(formData)
  }

  // eslint-disable-next-line no-unused-vars
  const uploadTaskDataToIpfs = async (data) => {
    console.log('starting to upload form data to ipfs')
    const fname = generateHashForObject(data)
    return storeObjectInIPFS(data, fname)
      .then(cid => {
        console.log('res from ipfs upload', cid, 'filename', fname)
        console.log(`view at https://${cid}.ipfs.dweb.link/${fname}`)
        console.log('\n\n')
        return `${cid}/${fname}`
      })
      .catch(e => {
        console.log('error when uploading', e)
      })
  }

  // eslint-disable-next-line no-unused-vars
  const uploadUserDataToSupabase = async (data) => {

  }

  const addTask = async ({
    email,
    title,
    description,
    tokenAmount,
    tokenAddress
  }) => {
    if (!library || !network) {
      console.log('Wallet provider object doesn\'t exist!')
      setState({ name: CreateTaskState.ErrorWalletConnect })
      return
    }

    setState({ name: CreateTaskState.PendingUploadToIpfs })
    const dataPath = await uploadTaskDataToIpfs({
      title,
      description
    })

    // uploadUserDataToSupabase({
    //   email,
    //   account
    // })

    setState({ name: CreateTaskState.PendingUserApproval })
    // const dataPath = 'bafybeick3k3kfrapb2xpzlv2omwxgnn7fei4rioe5g2t6cm3xmalfpjqwq/cfda5d713a6067c3dd070dfdc7eb655d'
    try {
      console.log('create contract instance')
      const { contractAddress } = getDeployedContractForChainId(network.chainId)
      const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(library, network.chainId)

      console.log('create options payload for on-chain transaction')
      let options = {}
      if (isEthBounty(tokenAddress)) {
        tokenAmount = unit.toWei(tokenAmount * 10 ** 18, 'wei').toString()
        options = { value: tokenAmount }
      } else {
        const erc20TokenContract = new ethers.Contract(tokenAddress, erc20ContractAbi, signer)
        // assumes all ERC20 tokens have 18 decimals, this is true for the majority, but not always
        tokenAmount = ethers.utils.parseUnits(tokenAmount, 18)
        const allowance = await (erc20TokenContract.allowance(account, contractAddress))

        if (allowance.isZero()) {
          const approvalResponse = await erc20TokenContract.approve(contractAddress, tokenAmount)
          console.log(approvalResponse)
        } else {
          const approvalResponse = await erc20TokenContract.approve(contractAddress, allowance.add(tokenAmount))
          console.log(approvalResponse)
        }
      }
      options = {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...options, // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...getDefaultTransactionGasOptions()
      }
      console.log('creating on-chain transaction with options', options)
      const addTaskTransaction = await taskPortalContract.addTask(ethers.utils.toUtf8Bytes(dataPath), tokenAddress, tokenAmount, options)
      setState({
        name: CreateTaskState.PendingContractTransaction
      })
      console.log('Waiting to add the task on-chain...', addTaskTransaction.hash)
      const res = await addTaskTransaction.wait()
      console.log('Transaction successfully executed:', addTaskTransaction, res)
      console.log('events', res.events)
      const shareEvent = res.events.find(event => event.event === 'NewNodeCreated' && event.args.nodeType === NodeType.Share)
      const data = {
        transactionHash: addTaskTransaction.hash,
        taskPath: shareEvent.args.parent,
        sharePath: shareEvent.args.path
      }

      await sleep(1000) // just a random wait, so that the transaction actually shows up in etherscan and share link will work
      // todo: maybe we can trigger a render of the share page in the background, so it's cached already??!?
      console.log('setting data in state', data)
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
            error
          })
      }
    }
  }

  const renderCurrencyDropdown = () => {
    return (<>
      <label htmlFor="bounty-token" className="sr-only">
        Bounty Token
      </label>
      <select
        {...register('tokenAddress')}
        id="tokenAddress"
        name="tokenAddress"
        required
        className="focus:ring-yellow-500 focus:border-yellow-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-sm"
      >
        {map(nameToTokenAddress, (value, key) => {
          return <option key={value} value={value}>{key}</option>
        })}
      </select>
    </>)
  }

  const renderAmountAndCurrencyFormFields = () => {
    return (<div>
      <label
        htmlFor="price"
        className="block text-sm font-medium text-gray-700"
      >
        Bounty Amount
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          {...register('tokenAmount')}
          required
          type="text"
          name="tokenAmount"
          id="tokenAmount"
          className="focus:ring-yellow-500 focus:border-yellow-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-sm"
          placeholder="0.00001"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {renderCurrencyDropdown()}
        </div>
      </div>
    </div>)
  }

  const onFormSubmit = handleSubmit(handleFormSubmit)

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

  const renderTaskDescriptionFormPart = () => {
    return <>
      {isWalletConnected && renderWalletAddressInputField(account)}
      {renderFormField({
        register,
        name: 'email',
        type: 'email',
        required: true
      })}
      {renderFormField({
        register,
        name: 'title',
        type: 'text',
        required: true
      })}
      <div className="">
        <label
          htmlFor="about"
          className="block text-sm font-medium text-gray-700"
        >
          Task Description
        </label>
        <div className="mt-1">
                            <textarea
                              {...register('description')}
                              id="description"
                              name="description"
                              required
                              rows={8}
                              className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border border-gray-300 rounded-sm"
                              defaultValue={''}
                            />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Write a few sentences about the task and how others
          can fulfill it.
        </p>
      </div>
    </>
  }

  const renderTaskBountyFormPart = () => {
    return <>
      {renderAmountAndCurrencyFormFields()}
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        {/* <div className="sm:col-span-2"> */}
        {/*   <dt className="text-md font-medium text-gray-500">Your share-able link</dt> */}
        {/*   <dd className="mt-1 text-md text-gray-900 truncate underline"> */}
        {/*     <a href={taskShareLink} target="_blank" rel="noopener noreferrer"> */}
        {/*       {taskShareLink} */}
        {/*     </a> */}
        {/*   </dd> */}
        {/* </div> */}
        <div className="sm:col-span-2">
          <dt className="text-md font-medium text-gray-500">What happens with my bounty?</dt>
          <dd className="mt-1 text-md text-gray-900">
            Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat.
            Excepteur
            qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure
            nostrud
            pariatur mollit ad adipisicing reprehenderit deserunt qui eu.
          </dd>
        </div>
      </dl>
    </>
  }

  function onNextStepSubmit (event) {
    event.preventDefault()
    setState({ name: CreateTaskState.PendingUserInputBounty })
  }

  const renderFormSubmitButton = () => {
    return localState.name === CreateTaskState.PendingUserInputBounty
      ? (<button
        type="submit"
        disabled={!isWalletConnected}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none"
      >
        Submit Task & Bounty
      </button>)
      : (<button
        onClick={(event) => onNextStepSubmit(event)}
        disabled={!isWalletConnected}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none"
      >
        Submit Task
      </button>)
  }

  return (<>
    <div className="px-4 py-8 sm:px-10">
      {localState.message && renderUseInfoMessage()}
      <div className="mt-2">
        <div>
          {localState.name === CreateTaskState.Default && (<label
            htmlFor="walletAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Wallet Address
          </label>)}
          {!isWalletConnected && (<div className="mt-1 mb-6">
            {renderWalletConnectComponent(account, web3Modal, dispatch)}
          </div>)}
        </div>
        <form onSubmit={onFormSubmit} className="space-y-6">
          {localState.name === CreateTaskState.Default && renderTaskDescriptionFormPart()}
          {localState.name === CreateTaskState.PendingUserInputBounty && renderTaskBountyFormPart()}
          {renderFormSubmitButton()}
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
