import ModalComponent from './ModalComponent'
import { debounce, get, truncate } from 'lodash'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { classNames } from '../utils'
import { renderFormField } from '../formUtils'
import { getDefaultTransactionGasOptions, getTaskPortalContractInstanceViaActiveWallet } from '../walletUtils'
import { ethers } from 'ethers'
import { EditTaskState } from '../const'
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'
import { getReadOnlyProviderForChainId } from '../apiUtils'
import { getDeployedContractForChainId } from '../constDeployedContracts'
import { useChainId } from '../useChainId'
import { useSigner } from 'wagmi'

interface EditTaskStateType {
  name: EditTaskState;
  data?: object;
}

export const useENS = (address: string) => {
  const [ensName, setENSName] = useState<string | null>(null)
  const [ensAvatar, setENSAvatar] = useState<string | null>(null)
  const [ensResolvedAddress, setENSResolvedAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const resolveENS = debounce(async () => {
      if (!address) {
        return
      }

      setLoading(true)
      setENSResolvedAddress(null)
      setENSName(null)
      setENSAvatar(null)

      const provider = getReadOnlyProviderForChainId(1)
      if (ethers.utils.isAddress(address)) {
        try {
          const ensName = await provider.lookupAddress(address)

          const resolver = ensName ? await provider.getResolver(ensName) : null
          const avatar = resolver ? await resolver.getAvatar() : null

          setENSName(ensName)
          if (avatar) {
            setENSAvatar(avatar.url)
          }
        } finally {
          setLoading(false)
        }
      } else {
        try {
          const resolvedAddress = await provider.resolveName(address)
          if (!resolvedAddress) {
            return
          }
          const resolver = await provider.getResolver(address)
          const avatar = await resolver.getAvatar()

          setENSResolvedAddress(resolvedAddress)
          setENSName(address)
          if (avatar) {
            setENSAvatar(avatar.url)
          }
        } finally {
          setLoading(false)
        }
      }
    }, 500)

    resolveENS()
  }, [address])

  return {
    ensName,
    ensAvatar,
    ensResolvedAddress,
    loading
  }
}

export default function TransferTaskModalComponent ({
  taskObject,
  onClose
}) {
  // const {
  //   address,
  //   isConnected
  // } = useAccount()
  const chainId = useChainId()
  const blockExplorerAddress = get(getDeployedContractForChainId(chainId), 'blockExplorer')
  const { data: signer } = useSigner()

  const [editTaskState, setEditTaskState] = useState<EditTaskStateType>({ name: EditTaskState.Default })

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      isDirty,
      errors
    }
  } = useForm()

  const newOwnerAddress = watch('newOwnerAddress')
  const {
    ensName,
    ensAvatar,
    ensResolvedAddress,
    loading
  } = useENS(newOwnerAddress)

  const validateInput = (input) => {
    return /[a-zA-Z]+\.[a-zA-Z]/gm.test(ensName) || ethers.utils.isAddress(input)
  }

  const onFormSubmit = async (formData) => {
    try {
      const { newOwnerAddress } = formData
      const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(signer, chainId)
      console.log('create options payload for on-chain transaction')
      const options = getDefaultTransactionGasOptions()
      console.log('creating on-chain transaction')
      const updateTaskTransaction = await taskPortalContract.updateTaskOwner(taskObject.path, ensResolvedAddress || newOwnerAddress, options)

      setEditTaskState({
        name: EditTaskState.Loading
      })

      console.log('Waiting to edit the task on-chain...', updateTaskTransaction.hash)
      const res = await updateTaskTransaction.wait()
      console.log('Transaction successfully executed:', updateTaskTransaction, res)
      setEditTaskState({
        name: EditTaskState.Success,
        data: { transactionHash: res }
      })
    } catch (error) {
      console.log(error)
      setEditTaskState({
        name: EditTaskState.Error,
        data: { error: JSON.stringify(error) }
      })
    }
  }

  const renderEditTask = () => {
    switch (editTaskState.name) {
      case EditTaskState.Default:
      case EditTaskState.Loading:
        return <div>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-sm">
            <div className="flex bg-yellow-50 p-4">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Attention needed</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Watch out! This action<span className="ml-1 font-semibold">cannot</span> be undone. <br />
                    This task will become read-only for you and only the new owner will be able to edit this task or
                    manage
                    the rewards.
                  </p>
                </div>
              </div>
            </div>

            {renderFormField({
              register,
              name: 'newOwnerAddress',
              type: 'text',
              required: true,
              label: 'New Owner Wallet Address or ENS name',
              placeholder: 'vitalik.eth',
              errors,
              validateFunction: validateInput
            })}
            {loading
              ? (<p className="text-sm font-semibold text-gray-700 animate-pulse flex max-w-lg">
                Loading
              </p>)
              : (<div className="flex items-center">
                  {ensAvatar && (<div className="mr-3">
                    <img
                      className="inline-block h-9 w-9 rounded-full"
                      src={ensAvatar}
                      alt=""
                    />
                  </div>)}
                  {(ensResolvedAddress || ensName) && (
                    <div className="">
                      <p
                        className="text-sm font-light text-gray-700 group-hover:text-gray-900 truncate">
                        {truncate(ensResolvedAddress, { length: 36 }) || ensName}
                      </p>
                      <a className="text-sm font-light text-gray-500 group-hover:text-gray-700 underline"
                         target="_blank" rel="noopener noreferrer"
                         href={`${blockExplorerAddress}/address/${ensResolvedAddress || ensName}`}
                      >View Address
                      </a>
                    </div>)}
                </div>
                )}

            <button
              disabled={!isDirty}
              className={classNames(isDirty ? 'hover:bg-primary-light focus:outline-none' : '', 'bg-primary  w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white ')}
            >
              Transfer task to new owner
            </button>
          </form>
        </div>
      case EditTaskState.Success:
        return <div>
          <p className="text-sm text-gray-700">
            🎉 Success 🥳<br />You transferred the task to {ensName || ensResolvedAddress}
          </p>
        </div>
      case EditTaskState.Error:
        return <div>
          Error, this shouldn't happen =/
          <br />
          {process.env.NODE_ENV === 'development' && get(editTaskState.data, 'error')}
        </div>
      default:
        break
    }
  }

  return <ModalComponent
    renderContent={renderEditTask}
    titleText="Transfer Task Ownership"
    onClose={onClose}
  />
}
