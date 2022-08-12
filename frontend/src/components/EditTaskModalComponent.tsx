import ModalComponent from './ModalComponent'
// eslint-disable-next-line node/no-missing-import
import { create, get, intersection, isEmpty, keys, omitBy, pick } from 'lodash'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import TaskDescriptionInputField from './TaskDescriptionInputField'
import { classNames, getSitePathForNode, refreshVercelPage } from '../utils'
import { renderFormField } from '../formUtils'
// eslint-disable-next-line node/no-missing-import
import { getDefaultTransactionGasOptions, getTaskPortalContractInstanceViaActiveWallet } from '../walletUtils'
import { ethers } from 'ethers'
// eslint-disable-next-line node/no-missing-import
import { EditTaskState, TASK_ADVANCED_FORM_FIELDS, TASK_ALL_FORM_FIELDS } from '../const'
import { uploadTaskDataToIpfs } from '../storageUtils'
// eslint-disable-next-line node/no-missing-import
import TaskAdvancedInputFields from './TaskAdvancedInputFields'
// eslint-disable-next-line node/no-missing-import
import { useChainId } from '../useChainId'
import { useSigner } from 'wagmi'

interface EditTaskStateType {
  name: EditTaskState;
  data?: object;
}

export default function EditTaskModalComponent ({
  taskObject,
  onClose
}) {
  taskObject = omitBy(taskObject, isEmpty)
  const chainId = useChainId()
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
  } = useForm({
    defaultValues: {
      title: taskObject.title,
      subtitle: taskObject.subtitle,
      description: taskObject.description
    }
  })

  const onFormSubmit = async (formData) => {
    try {
      setEditTaskState({
        name: EditTaskState.Loading
      })

      formData = omitBy(formData, isEmpty)
      const ipfsData = create(pick(taskObject, TASK_ALL_FORM_FIELDS), formData)
      const dataPath = await uploadTaskDataToIpfs(ipfsData)

      if (!dataPath) {
        setEditTaskState({
          name: EditTaskState.Error,
          data: { error: 'Failed to upload data to IPFS' }
        })
      }
      const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(signer, chainId)
      console.log('create options payload for on-chain transaction')
      const options = getDefaultTransactionGasOptions()
      console.log('creating on-chain transaction')
      const updateTaskTransaction = await taskPortalContract.updateTaskData(taskObject.path, ethers.utils.toUtf8Bytes(dataPath), options)

      console.log('Waiting to edit the task on-chain...', updateTaskTransaction.hash)
      const res = await updateTaskTransaction.wait()
      console.log('Transaction successfully executed:', updateTaskTransaction, res)

      const vercelRefreshResult = await refreshVercelPage(getSitePathForNode({
        nodeType: 'task',
        chainId,
        path: taskObject.path
      }))
      console.log('vercelRefreshResult', vercelRefreshResult)
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
    const hasAdvancedFieldInExistingTask = intersection(keys(taskObject), TASK_ADVANCED_FORM_FIELDS).length > 0
    switch (editTaskState.name) {
      case EditTaskState.Default:
        return <div>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-sm">
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
              required: false,
              label: 'Subtitle (optional)',
              placeholder: 'Support us by doing X'
            })}
            <TaskDescriptionInputField
              register={register}
              watch={watch}
              errorsForField={get(errors, 'description')}
            />
            <TaskAdvancedInputFields
              register={register}
              values={pick(taskObject, TASK_ADVANCED_FORM_FIELDS)}
              allowHide={!hasAdvancedFieldInExistingTask}
            />
            <button
              disabled={!isDirty}
              className={classNames(isDirty ? 'hover:bg-primary-light focus:outline-none' : '', 'bg-primary  w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white ')}
            >
              Submit changes
            </button>
          </form>
        </div>
      case EditTaskState.Loading:
        return <p className="text-sm font-semibold text-gray-700 animate-pulse flex max-w-lg">
          Pending...
        </p>
      case EditTaskState.Success:
        return <div>
          <p className="text-sm text-gray-700">
            🎉 Success 🥳<br />You edited the task, refresh this page to see the changes
          </p>
        </div>
      case EditTaskState.Error:
        return <div>
          Error, this shouldn't happen =/
          <br />
          {process.env.NODE_ENV === 'development' && get(editTaskState.data, 'error')}
        </div>
    }
  }

  return <ModalComponent
    renderContent={renderEditTask}
    titleText="Edit your task"
    onClose={onClose}
  />
}
