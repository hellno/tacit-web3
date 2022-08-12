import { getDeployedContractForChainId, isNativeChainCurrency, taskPortalContractAbi } from '../constDeployedContracts'
// eslint-disable-next-line node/no-missing-import
import { useChainId } from '../useChainId'
// eslint-disable-next-line node/no-missing-import
import { CreateTaskState, NodeType } from '../const'
import { addUserToDatabase } from '../supabase'
import PresentActionLinksComponent from './PresentActionLinksComponent'
import {
  erc20ABI,
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite
} from 'wagmi'
import { defaultsDeep, filter, get, isEmpty } from 'lodash'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { MarkdownComponent } from '../markdownUtils'
import { analyticsTrackEvent } from '../analyticsUtils'
import { useState } from 'react'
import { makeIpfsPathForOnChainTask } from '../apiUtils'
import { ethers } from 'ethers'
import { classNames, getBountyAmount, getBountyCurrency, isDevEnv } from '../utils'

const unit = require('ethjs-unit')

export default function SubmitTaskOnChainComponent ({
  state: localState,
  setState
}) {
  const [canSubmitButton, setCanSubmitButton] = useState(false)

  // const renderCounter = useRef(0)
  // renderCounter.current = renderCounter.current + 1
  // console.log('renderCount', renderCounter.current)

  const {
    address
  } = useAccount()
  const chainId = useChainId()

  const { data: formData } = localState

  const {
    email,
    tokenAmount,
    tokenAddress,
    ipfsDataPath
  } = formData
  const { contractAddress } = getDeployedContractForChainId(chainId)
  const isERC20TokenTask = !isNativeChainCurrency(tokenAddress)
  const tokenAmountBigNumber = ethers.utils.parseUnits(tokenAmount.toString(), 18)

  let transactionValue = '0'
  let executeERC20ContractSpending

  if (isERC20TokenTask) {
    const {
      data: erc20ContractAllowance,
      status: statusLoadingERC20ContractSpending
      // error: errorLoadingERC20ContractSpending,
      // success: isSuccessLoadingERC20ContractSpending
    } = useContractRead({
      addressOrName: tokenAddress,
      contractInterface: erc20ABI,
      functionName: 'allowance',
      args: [address, contractAddress],
      onSettled (data, error) {
        console.log('settled allowance erc20 contract read', data, error)
        setCanSubmitButton(true)
      }
    })

    let approvalTokenAmount = 0
    if (statusLoadingERC20ContractSpending === 'success') {
      approvalTokenAmount = erc20ContractAllowance.isZero() ? tokenAmountBigNumber : erc20ContractAllowance.add(tokenAmountBigNumber)
    }
    // console.log('statusLoadingERC20ContractSpending', statusLoadingERC20ContractSpending)
    // console.log('erc20ContractAllowance.isZero()', erc20ContractAllowance.isZero(), 'tokenAmountBigNumber', tokenAmountBigNumber, 'erc20ContractAllowance', erc20ContractAllowance)

    const { config: approveERC20ContractAllowanceConfig } = usePrepareContractWrite({
      addressOrName: tokenAddress, // changing this breaks shit
      contractInterface: ['function approve(address,uint256)'],
      functionName: 'approve',
      args: [contractAddress, approvalTokenAmount.toString()]
    })

    const {
      // data: approveERC20ContractAllowanceData,
      // error: approveERC20ContractAllowanceError,
      write: approveERC20ContractAllowanceWrite
      // status: approveERC20ContractAllowanceStatus
    } = useContractWrite({
      ...approveERC20ContractAllowanceConfig,
      onSuccess (data) {
        console.log('successful approved erc20 token spending', data)
        addTask()
      }
    })
    executeERC20ContractSpending = approveERC20ContractAllowanceWrite
    // console.log(
    //   'approveERC20ContractAllowanceData',
    //   approveERC20ContractAllowanceData,
    //   'approveERC20ContractAllowanceStatus',
    //   approveERC20ContractAllowanceStatus
    // )
  } else {
    transactionValue = unit.toWei(tokenAmount * 10 ** 18, 'wei').toString()
  }

  const NodeUpdatedEventListener = (event) => {
    console.log('received new on-chain event', event)
    const [path, owner, nodeType, parent, eventData] = event

    if (owner !== address) {
      return
    }

    if (nodeType === NodeType.Share) {
      console.log('processing share event', eventData)

      const isEventForThisSubmittedTransaction = eventData.transactionHash
      if (!isEventForThisSubmittedTransaction) {
        // can happen that we caught an event that is not for the
        // transaction that was submitted in this browser window
        // todo: improve matching, but consider tab changes, long on-chain transaction wait times, etc
        return
      }
      const newStateData = {
        transactionHash: eventData.transactionHash,
        taskPath: parent,
        sharePath: path
      }

      analyticsTrackEvent('CreatedTask', { ...newStateData, ...{ chainId } })

      // todo: trigger a render of the share page in the background, so it's cached already??!?
      setState({
        name: CreateTaskState.DoneCreatingTask,
        data: defaultsDeep(newStateData, formData)
      })
    }
  }

  useContractEvent({
    addressOrName: contractAddress,
    contractInterface: taskPortalContractAbi,
    eventName: 'NodeUpdated',
    listener: NodeUpdatedEventListener
  })

  const addTaskOptions = {
    addressOrName: contractAddress,
    contractInterface: taskPortalContractAbi,
    functionName: 'addTask',
    args: [makeIpfsPathForOnChainTask(ipfsDataPath), tokenAddress, tokenAmountBigNumber.toString()],
    overrides: {
      value: transactionValue,
      gasLimit: 600000
    }
  }

  const {
    config: addTaskTransactionConfig,
    error: addTaskPrepareTransactionError
  } = usePrepareContractWrite(addTaskOptions)

  if (addTaskPrepareTransactionError) {
    if (addTaskPrepareTransactionError instanceof TypeError) {
      console.log('addTaskPrepareTransactionError', addTaskPrepareTransactionError)
    } else {
      console.log('addTaskPrepareTransactionError but no typeerror', addTaskPrepareTransactionError)

      // setState({
      //   name: CreateTaskState.ErrorCreatingTask,
      //   data: formData,
      //   error: addTaskPrepareTransactionError.reason || addTaskPrepareTransactionError.toString()
      // })
    }
  }

  const {
    // data: addTaskTransactionData,
    error: addTaskTransactionError,
    write: executeAddTaskTransaction,
    status: addTaskTransactionStatus
  } = useContractWrite({
    ...addTaskTransactionConfig,
    onSettled (data, error) {
      console.log('settled adding task contract write', data, error)
      // if (!error) {
      //   setState({
      //     name: CreateTaskState.PendingOnChainTaskCreation,
      //     data: formData
      //   })
      // }
    }
  })

  if (addTaskTransactionError) {
    const isUserRejectedTransaction = addTaskTransactionError === 'User rejected request'
    console.log('addTaskTransactionError', addTaskTransactionError, 'isUserRejectedTransaction', isUserRejectedTransaction)
  }

  console.log('addTaskTransactionStatus', addTaskTransactionStatus)

  const uploadUserDataToOffChainDatabase = async () => {
    const userUploadStatus = await addUserToDatabase({
      walletAddress: address,
      email
    })

    if (!userUploadStatus.success && userUploadStatus.error) {
      console.log('ERROR IN UPLOADING USER DATA TO OFF-CHAIN DB')
      setState({
        name: CreateTaskState.ErrorCreatingTask,
        data: formData,
        error: userUploadStatus.error
      })
    }
  }

  const addTask = () => {
    try {
      console.log('Waiting to add the task on-chain...')
      setState({
        name: CreateTaskState.PendingTaskCreationTransactionApproval,
        data: formData
      })

      executeAddTaskTransaction?.()
    } catch (error) {
      console.log('error when executing add task transaction', error)
      switch (error.code) {
        case -32602:
          setState({
            name: CreateTaskState.PendingUserTaskInput,
            data: formData,
            message: error.message
          })
          break
        default:
          setState({
            name: CreateTaskState.ErrorCreatingTask,
            data: formData,
            error: JSON.stringify(error)
          })
      }
    }
  }

  const onButtonSubmit = async () => {
    setState({
      name: CreateTaskState.PendingUserApproval,
      data: formData
    })
    if (email) {
      await uploadUserDataToOffChainDatabase()
    }

    if (isERC20TokenTask) {
      setState({
        name: CreateTaskState.PendingERC20ContractApproval,
        data: formData
      })
      try {
        executeERC20ContractSpending()
      } catch (error) {
        console.log('error when executing erc20 approval transaction', error)
      }
    } else {
      addTask()
    }
  }

  // let canSubmitButton = true
  // if (isERC20TokenTask) {
  //   canSubmitButton = !isUndefined(executeERC20ContractSpending) && canSubmitButton
  // }

  const renderInitialTaskSubmit = () => {
    const tokenCurrency = getBountyCurrency(tokenAddress, chainId)
    const userTokenAmount = getBountyAmount(tokenAmount)

    return <div className="px-4 py-8 sm:px-10">
      <div className="space-y-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div>
              <dd className="text-base text-gray-500">Title</dd>
              <dt className="text-lg leading-6 font-medium text-gray-900">{formData.title}</dt>
            </div>
          </div>
          <div className="sm:col-span-2">
            <div>
              <dd className="text-base text-gray-500">Bounty</dd>
              <dt
                className="text-lg leading-6 font-medium text-gray-900">{userTokenAmount} {tokenCurrency}</dt>
            </div>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-base text-gray-500">
              Description Preview
            </dt>
            <dd className="mt-2 text-md text-gray-900">
              <MarkdownComponent content={formData.description} />
            </dd>
          </div>
        </dl>
        <button
          onClick={() => onButtonSubmit()}
          disabled={!canSubmitButton}
          className={classNames(canSubmitButton && 'hover:bg-primary-light',
            'w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-primary focus:outline-none')}
        >
          Submit Task & Bounty
        </button>
      </div>
    </div>
  }

  const renderStepIndicator = (currStepId) => {
    const erc20ApprovalStep = {
      name: 'Step 3 - Approve ERC20 token spending',
      href: '#',
      status: 'upcoming'
    }

    const steps = [{
      name: 'Step 1 - Submit task details',
      href: '#',
      status: 'complete'
    }, {
      name: 'Step 2 - Upload public data to IPFS',
      href: '#',
      status: 'current'
    }, isERC20TokenTask ? erc20ApprovalStep : {},
    {
      name: `Step ${isERC20TokenTask ? 4 : 3} - Approve and wait for task creation`,
      href: '#',
      status: 'upcoming'
    }
      // , {
      //   name: `Step ${isERC20TokenTask ? 5 : 4} - Wait for on-chain transaction`,
      //   href: '#',
      //   status: 'upcoming'
      // }
    ]

    return <div className="py-12 px-4 sm:px-6 lg:px-8">
      <nav className="flex justify-center" aria-label="Progress">
        <ol role="list" className="space-y-6">
          {filter(steps, (step) => !isEmpty(step)).map((step, idx) => (<li key={step.name}>
            {idx < currStepId
              ? (<div className="group">
                  <span className="flex items-start">
                    <span className="flex-shrink-0 relative h-5 w-5 flex items-center justify-center">
                      <CheckCircleIcon
                        className="h-full w-full text-secondary group-hover:text-secondary"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-500">
                      {step.name}
                    </span>
                  </span>
              </div>)
              : idx === currStepId
                ? (<div className="flex items-start" aria-current="step">
                  <span className="flex-shrink-0 h-5 w-5 relative flex items-center justify-center" aria-hidden="true">
                    <span className="absolute h-4 w-4 rounded-full animate-pulse bg-secondary-light" />
                    <span className="relative block w-2 h-2 bg-white rounded-full" />
                  </span>
                  <span className="ml-3 text-sm font-medium text-secondary">{step.name}</span>
                </div>)
                : (<div className="group">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 relative flex items-center justify-center"
                         aria-hidden="true">
                      <div className="h-2 w-2 bg-gray-300 rounded-full" />
                    </div>
                    <p className="ml-3 text-sm font-medium text-gray-500">{step.name}</p>
                  </div>
                </div>)}
          </li>))}
        </ol>
      </nav>
    </div>
  }
  const stateName = get(localState, 'name')

  const renderContent = () => {
    switch (stateName) {
      case CreateTaskState.PendingUserOnChainApproval:
        return renderInitialTaskSubmit()
      case CreateTaskState.PendingUserApproval:
        return <div className="px-4 py-8 sm:px-10">
          <div className="mt-0">
            {renderStepIndicator(1)}
          </div>
        </div>
      case CreateTaskState.PendingERC20ContractApproval:
        return <div className="px-4 py-8 sm:px-10">
          <div className="mt-0">
            {renderStepIndicator(2)}
          </div>
        </div>
      case CreateTaskState.PendingTaskCreationTransactionApproval:
        return <div className="px-4 py-8 sm:px-10">
          <div className="mt-0">
            {renderStepIndicator(isERC20TokenTask ? 3 : 2)}
          </div>
        </div>
      case CreateTaskState.PendingOnChainTaskCreation:
        return <div className="px-4 py-8 sm:px-10">
          <div className="mt-0">
            {renderStepIndicator(isERC20TokenTask ? 4 : 3)}
          </div>
        </div>
      case CreateTaskState.DoneCreatingTask:
        return <>
          <div className="px-4 py-8 sm:px-10">
            <PresentActionLinksComponent data={formData} />
          </div>
          <div className="px-4 py-6 bg-gray-50 border-t-2 border-gray-200 sm:px-10">
            <p className="text-xs leading-5 text-gray-500">
              Thank you for being early (🤩, 🤩)
            </p>
          </div>
        </>
    }
  }

  return <div className="mt-2">
    {renderContent()}
    <div className="mt-5 sm:mt-2 sm:flex-shrink-0 sm:flex sm:items-center">
      {isDevEnv() && <button
        onClick={() => setState({
          name: CreateTaskState.PendingUserOnChainApproval,
          data: formData
        })}
        type="button"
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-sm text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
      >
        Go back
      </button>
      }
    </div>
  </div>
}
