import ModalComponent from './ModalComponent'
// eslint-disable-next-line node/no-missing-import
import { BountyPayoutState } from '../const'
import { classNames } from '../utils'
import {
  getNameToTokenAddressForChainId,
  NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT
} from '../constDeployedContracts'
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/outline'
import { filter, get, includes, invert, isEmpty, map, pickBy, sum, uniq, uniqBy, zipObject } from 'lodash'
import { useFieldArray, useForm } from 'react-hook-form'
import { AppContext } from '../context'
import { useContext } from 'react'

export default function PayoutBountyModalComponent ({
  state,
  taskObject,
  allNodes,
  onSubmit,
  onClose
}) {
  const [globalState] = useContext(AppContext)
  const {
    account
  } = globalState
  const isWalletConnected = !isEmpty(account)

  const defaultPayoutFields = isEmpty(allNodes)
    ? []
    : map(uniqBy(allNodes, 'owner'), (node) => ({
      // @ts-ignore
      address: node.owner,
      tokenAddress: NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT,
      tokenAmount: '2'
    }))

  const {
    register,
    control,
    handleSubmit,
    getValues
  } = useForm({
    defaultValues: { payoutFields: defaultPayoutFields }
  })

  const {
    fields,
    append,
    remove
  } = useFieldArray({
    control,
    name: 'payoutFields'
  })

  const nameToTokenAddress = getNameToTokenAddressForChainId(taskObject.chainId)
  const bountyTokenAddresses = map(taskObject.bounties, 'tokenAddress')
  const bountiesNameToTokenAddress = pickBy(nameToTokenAddress, (tokenAddress, name) => includes(bountyTokenAddresses, tokenAddress))
  // const formFieldPayoutFields = getValues('payoutFields')

  const payoutRecipients = uniq(map(allNodes, 'owner'))

  const renderPayoutModalContent = () => {
    if (state.name === BountyPayoutState.Success) {
      return (<div>
        <p className="text-sm text-gray-700">
          🎉 Success 🥳<br />Your payout was sent on-chain
        </p>
      </div>)
    }

    if (state.name === BountyPayoutState.Loading) {
      const tokenAddressToPayoutSum = zipObject(bountyTokenAddresses, map(bountyTokenAddresses, (bountyTokenAddress) => {
        return sum(map(filter(state.data.payoutFields, (node) => node.tokenAddress === bountyTokenAddress), (field) => parseFloat(field.tokenAmount))) || 0
      }))
      const tokenAddressToName = invert(nameToTokenAddress)

      return (<div>
        Pending - Confirm your wallet transactions
        <br /><br />
        <span className="font-semibold">Total payout</span>
        {map(tokenAddressToPayoutSum, (payoutSum, tokenAddress) =>
          <p>{get(tokenAddressToName, tokenAddress)}: {payoutSum}</p>)}
      </div>)
    }

    return (<form onSubmit={handleSubmit(onSubmit)}>
      <ul role="list" className="divide-y divide-gray-200">
        {fields.map((node, index) => (
          <li key={`li-${node.id}`} className="py-2">
            <div className="relative py-2">
              <fieldset className="">
                <legend className="block text-sm font-medium text-gray-700">Payout {index + 1}</legend>
                <div className="mt-1 rounded-sm shadow-sm -space-y-px">
                  {/* <div> */}
                  {/*   <label htmlFor="country" className="sr-only"> */}
                  {/*     Country */}
                  {/*   </label> */}
                  {/*   <select */}
                  {/*     id="country" */}
                  {/*     name="country" */}
                  {/*     autoComplete="country-name" */}
                  {/*     className="focus:ring-indigo-500 focus:border-indigo-500 relative block w-full rounded-none rounded-t-md bg-transparent focus:z-10 sm:text-sm border-gray-300" */}
                  {/*   > */}
                  {/*     <option>United States</option> */}
                  {/*     <option>Canada</option> */}
                  {/*     <option>Mexico</option> */}
                  {/*   </select> */}
                  {/* </div> */}
                  <div>
                    <label htmlFor="postal-code" className="sr-only">
                      Payout Recipient Address
                    </label>
                    <select
                      {...register(`payoutFields.${index}.address`)}
                      key={node.id}
                      name={`payoutFields.${index}.address`}
                      required
                      className="focus:ring-yellow-500 focus:border-yellow-500 w-full py-2 pl-2 pr-7 bg-transparent text-gray-500 sm:text-sm rounded-t-sm border-gray-300"
                    >
                      {map(payoutRecipients, (payoutAddress) => {
                        return <option key={payoutAddress} value={payoutAddress}>{payoutAddress}</option>
                      })}
                    </select>
                  </div>
                  <div className="relative shadow-sm">
                    <input
                      {...register(`payoutFields.${index}.tokenAmount`)}
                      required
                      type="text"
                      name={`payoutFields.${index}.tokenAmount`}
                      id={node.id}
                      className="focus:ring-yellow-500 focus:border-yellow-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-b-sm"
                      placeholder="0.00001"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <select
                        {...register(`payoutFields.${index}.tokenAddress`)}
                        id={node.id}
                        name={`payoutFields.${index}.tokenAddress`}
                        required
                        className="focus:ring-yellow-500 focus:border-yellow-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-b-sm"
                      >
                        {map(bountiesNameToTokenAddress, (tokenAddress, name) => {
                          return <option key={tokenAddress} value={tokenAddress}>{name}</option>
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </li>))}
      </ul>
      <div className="my-4 sm:flex-1 sm:flex sm:items-center">
        {/* <div className="my-4 sm:flex-1 sm:flex sm:items-center sm:justify-between"> */}
        <div>
          <button
            className="inline-flex rounded-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 text-gray-700"
            onClick={() => append({
              tokenAddress: bountyTokenAddresses[0],
              address: allNodes[0].owner
            })}>
            <PlusCircleIcon className="h-5 w-5 mt-0.5 mr-1" />Add payout
          </button>
        </div>
        <div className="ml-4">
          <button
            className="inline-flex rounded-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 text-gray-700"
            onClick={() => remove(-1)}>
            <MinusCircleIcon className="h-5 w-5 mt-0.5 mr-1" />Remove payout
          </button>
        </div>
        <div>
          <div className="text-sm text-gray-700">
            {/* <span className="font-semibold">Total payout</span> */}
            {/*   {map(tokenAddressToPayoutSum, (payoutSum, tokenAddress) => */}
            {/*     <p>{get(tokenAddressToName, tokenAddress)}: {payoutSum}</p>)} */}
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={!isWalletConnected}
        className={classNames(isWalletConnected ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-300', 'w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white focus:outline-none')}
      >
        Payout bounties
      </button>
    </form>)
  }

  return <ModalComponent
    renderContent={renderPayoutModalContent}
    titleText="Payout your bounty"
    onClose={onClose}
  />
}
