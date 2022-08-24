import { useFieldArray, useForm } from 'react-hook-form'
import { BiconomyLoadingState, SharePageState } from '../const'
import { renderFormField, renderWalletAddressInputField } from '../formUtils'
import { classNames } from '../utils'
import { colors } from '../../colors'
import { get, isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import tinycolor from 'tinycolor2'
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/solid'
import { useMainnetEnsName } from '../walletUtils'
import { useChainId } from '../useChainId'
import WalletConnectButtonForForm from './WalletConnectButtonForForm'
import PresentActionLinksComponent from './PresentActionLinksComponent'
import ModalComponent from './ModalComponent'

export default function SharePageModal ({
  shareObject,
  sharePageState,
  biconomyState,
  handleFormSubmit,
  titleText,
  onModalClose
}) {
  let multiQuestionField = get(shareObject, 'multiQuestionField')
  multiQuestionField = multiQuestionField && multiQuestionField.split('\n').map(question => ({
    question,
    answer: ''
  }))

  const {
    register,
    control,
    handleSubmit
  } = useForm({
    defaultValues: {
      multiQuestionField
    }
  })
  const {
    fields
  } = useFieldArray({
    control,
    name: 'multiQuestionField'
  })
  const {
    address,
    isConnected
  } = useAccount()
  const chainId = useChainId()
  const ensName = useMainnetEnsName(address)
  const isUserOnCorrectChain = isConnected && shareObject && shareObject.chainId === chainId
  const walletAddress = ensName || address
  const primaryColor = get(shareObject, 'primaryColorHex') || colors.primary.DEFAULT
  const primaryColorHover = tinycolor(primaryColor).lighten(10)

  const buttonBgPrimaryColorOnMouseOverEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColorHover
  }

  const buttonBgPrimaryColorOnMouseOutEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColor
  }

  const renderGaslessTransactionSetupProgress = () => {
    switch (biconomyState.name) {
      case BiconomyLoadingState.Success:
        return <div className="rounded-sm bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Free / Gas-less Transactions are ready for you</p>
            </div>
          </div>
        </div>
      case BiconomyLoadingState.Error:
        return <div className="rounded-sm bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Something went wrong when loading gasless transactions
                for you</h3>
              <div className="mt-2 text-sm text-red-700">
                {biconomyState.biconomy}
              </div>
            </div>
          </div>
        </div>
      case BiconomyLoadingState.Loading:
        return <div className="rounded-sm bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">Setting up free / gas-less transaction for you</p>
              {/* <p className="mt-3 text-sm md:mt-0 md:ml-6"> */}
              {/*   <a href="#" className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"> */}
              {/*     Details <span aria-hidden="true">&rarr;</span> */}
              {/*   </a> */}
              {/* </p> */}
            </div>
          </div>
        </div>
    }
  }

  const renderSolveIntentContent = () => {
    return <div>
      <div className="mt-6 mr-8">
        <label
          htmlFor="walletAddress"
          className="block text-sm font-medium text-gray-700"
        >
          Wallet Address
        </label>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            {renderWalletAddressInputField(walletAddress)}
          </div>
          <div>
            {renderFormField({
              register,
              name: 'email',
              type: 'email',
              label: 'Your Email'
            })}
            <p className="mt-2 text-sm text-gray-500">
              Enter your email so that the poster can get in touch with you if needed. Is stored off-chain.
            </p>
          </div>
          <div className="">
            {!isEmpty(multiQuestionField)
              ? (<div className="mt-4 space-y-4 ">
                {fields.map((field: any, index) => (
                  <div key={field.id}>
                    <label
                      htmlFor={field.id}
                      className="block text-md font-medium text-gray-700"
                    >
                      {field.question}
                    </label>
                    <input
                      type="text"
                      id={field.id}
                      {...register(`multiQuestionField.${index}.answer`)}
                      className="w-full text-gray-900 focus:ring-gray-500 focus:border-gray-500 border-gray-300 sm:text-sm mt-1 block shadow-sm rounded-sm"
                    />
                  </div>
                ))}
              </div>)
              : (<>
                <label
                  htmlFor="solution"
                  className="block text-md font-medium text-gray-700"
                >
                  {shareObject.headerSolutionModal || 'Your description'}
                </label>
                <div className="mt-1">
                  <textarea
                    // @ts-ignore
                    {...register('solution')}
                    id="solution"
                    name="solution"
                    required
                    rows={3}
                    className="shadow-sm focus:ring-gray-500 block w-full sm:text-sm border border-gray-300 rounded-sm"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {shareObject.subtitleSolutionModal || 'This could be your email address, your Discord / Twitter name or something else the poster requested.'}
                </p>
              </>)}
          </div>
          {!isConnected || !isUserOnCorrectChain
            ? <WalletConnectButtonForForm
              requiredChainId={shareObject.chainId}
            />
            : <div>
              <button
                type="submit"
                style={{ backgroundColor: primaryColor }}
                onMouseOver={buttonBgPrimaryColorOnMouseOverEventHandler}
                onMouseOut={buttonBgPrimaryColorOnMouseOutEventHandler}
                className={classNames('w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white focus:outline-none')}
              >
                Submit
              </button>
            </div>}
          {renderGaslessTransactionSetupProgress()}
        </form>
      </div>
    </div>
  }

  const renderShareIntentContent = () => {
    return <div>
      <div className="mt-6 mr-8">
        <label
          htmlFor="walletAddress"
          className="block text-sm font-medium text-gray-700"
        >
          Wallet Address
        </label>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            {renderWalletAddressInputField(walletAddress)}
          </div>
          <div>
            {renderFormField({
              register,
              name: 'email',
              type: 'email',
              label: 'Your Email'
            })}
            <p className="mt-2 text-sm text-gray-500">
              Enter your email so that the poster can get in touch with you if needed. Is stored off-chain.
            </p>
          </div>
          {!isConnected || !isUserOnCorrectChain
            ? <WalletConnectButtonForForm
              requiredChainId={shareObject.chainId}
            />
            : <div>
              <button
                type="submit"
                style={{ backgroundColor: primaryColor }}
                onMouseOver={buttonBgPrimaryColorOnMouseOverEventHandler}
                onMouseOut={buttonBgPrimaryColorOnMouseOutEventHandler}
                className={classNames(
                  'w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white focus:outline-none')}
              >
                Create my share link
              </button>
            </div>}
          {renderGaslessTransactionSetupProgress()}
        </form>
      </div>
    </div>
  }

  const renderSolveModalContent = () => {
    switch (sharePageState.name) {
      case SharePageState.ShareIntent:
        return renderShareIntentContent()
      case SharePageState.SolveIntent:
        return renderSolveIntentContent()
      case SharePageState.PendingShare:
      case SharePageState.PendingSolve:
        return <div><p className="text-sm text-gray-500 animate-pulse">
          Waiting for on-chain transaction...
        </p></div>
      case SharePageState.SuccessSubmitShare:
      case SharePageState.SuccessSubmitSolve:
        return <div>
          <p className="mb-4 text-md font-normal text-gray-500">
            You did it 🥳
          </p>
          <PresentActionLinksComponent data={sharePageState.data} />
        </div>
      case SharePageState.FailSubmitShare:
      case SharePageState.FailSubmitSolve:
        return <div>something went wrong here :(</div>
    }
  }

  return <ModalComponent
    renderContent={renderSolveModalContent}
    titleText={titleText}
    onClose={onModalClose}
  />
}
