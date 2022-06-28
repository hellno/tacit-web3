import ModalComponent from './ModalComponent'
// eslint-disable-next-line node/no-missing-import
import { create, get, intersection, isEmpty, isNil, keys, omitBy, pick } from 'lodash'
import { AppContext } from '../context'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import TaskDescriptionInputField from './TaskDescriptionInputField'
import { classNames } from '../utils'
import { renderFormField } from '../formUtils'
import { getDefaultTransactionGasOptions, getTaskPortalContractInstanceViaActiveWallet } from '../walletUtils'
import { ethers } from 'ethers'
// eslint-disable-next-line node/no-missing-import
import { EditTaskState, TASK_VIEW_FORM_FIELDS } from '../const'
import { uploadTaskDataToIpfs } from '../storageUtils'
// eslint-disable-next-line node/no-missing-import
import TaskAdvancedInputFields from './TaskAdvancedInputFields'

interface EditTaskStateType {
  name: EditTaskState;
  data?: object;
}

export default function EditTaskModalComponent ({
  taskObject,
  onClose
}) {
  taskObject = omitBy(taskObject, isEmpty)
  console.log(taskObject)

  const [globalState] = useContext(AppContext)
  const {
    library,
    network
  } = globalState

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
      description: taskObject.description
    }
  })

  const onFormSubmit = async (formData) => {
    try {
      formData = omitBy(formData, isNil)
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      const ipfsData = create(pick(taskObject, TASK_VIEW_FORM_FIELDS), formData)
      const dataPath = await uploadTaskDataToIpfs(ipfsData)

      if (!dataPath) {
        setEditTaskState({
          name: EditTaskState.Error,
          data: { error: 'Failed to upload data to IPFS' }
        })
      }
      const signer = library.getSigner()
      const taskPortalContract = getTaskPortalContractInstanceViaActiveWallet(signer, network.chainId)
      console.log('create options payload for on-chain transaction')
      const options = getDefaultTransactionGasOptions()
      console.log('creating on-chain transaction')
      const updateTaskTransaction = await taskPortalContract.updateTaskData(taskObject.path, ethers.utils.toUtf8Bytes(dataPath), options)

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
    const advancedFields = ['subtitle', 'ctaReferral', 'ctaSolution']
    const hasAdvancedFieldInExistingTask = intersection(keys(taskObject), advancedFields).length > 0
    switch (editTaskState.name) {
      case EditTaskState.Default:
      case EditTaskState.Loading:
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
            <TaskDescriptionInputField
              register={register}
              watch={watch}
              errorsForField={get(errors, 'description')}
            />
            <TaskAdvancedInputFields
              register={register}
              values={pick(taskObject, advancedFields)}
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
