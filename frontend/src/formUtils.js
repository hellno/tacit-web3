import { ceil, get, invert, isEmpty, map, startCase } from 'lodash'
import { classNames } from './utils'

export const renderWalletAddressInputField = (account) => {
  return <input
    type="text"
    name="walletAddress"
    id="walletAddress"
    placeholder="Wallet Address"
    value={account}
    disabled={true}
    className="select-none text-gray-600 mt-1 block w-full shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm border-gray-300 rounded-sm"
  />
}

export const renderFormField = ({
  register,
  name,
  type,
  defaultValue = undefined,
  required = false,
  label = '',
  placeholder = '',
  errors = {}
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-md font-medium text-gray-700"
      >
        {label || startCase(name)}
      </label>
      <input
        {...register(name, { required })}
        type={type}
        name={name}
        id={name}
        placeholder={placeholder || label || startCase(name)}
        defaultValue={defaultValue}
        required={required}
        className={classNames(
          get(errors, name)
            ? 'border-red-300 text-red-800 placeholder-red-400 focus:outline-none focus:ring-red-500 focus:border-red-500'
            : 'text-gray-900 focus:ring-gray-500 focus:border-gray-500 border-gray-300',
          ' sm:text-sm mt-1 block w-full shadow-sm rounded-sm'
        )}
      />
    </div>
  )
}

export const renderCurrencyDropdown = ({
  register,
  fieldName,
  nameToTokenAddress
}) => {
  return (<>
    <label htmlFor="bounty-token" className="sr-only">
      Bounty Token
    </label>
    <select
      {...register(fieldName)}
      id={fieldName}
      name={fieldName}
      required
      className="focus:ring-gray-500 focus:border-gray-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-sm"
    >
      {map(nameToTokenAddress, (tokenAddress, name) => {
        return <option key={tokenAddress} value={tokenAddress}>{name}</option>
      })}
    </select>
  </>)
}

export const renderAmountAndCurrencyFormFields = ({
  register,
  watch,
  nameToTokenAddress,
  tokenAddressToMaxAmount
}) => {
  const tokenAddress = watch('tokenAddress')
  const maxToken = get(tokenAddressToMaxAmount, tokenAddress, 0.0)
  const tokenAddressToName = invert(nameToTokenAddress)

  return (<div>
    <div className="relative rounded-sm shadow-sm">
      <input
        {...register('tokenAmount')}
        required
        type="text"
        name="tokenAmount"
        id="tokenAmount"
        className="focus:ring-gray-500 focus:border-gray-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-sm"
        placeholder="0.00001"
      />
      <div className="absolute inset-y-0 right-0 flex items-center">
        {renderCurrencyDropdown({
          register,
          fieldName: 'tokenAddress',
          nameToTokenAddress
        })}
      </div>
    </div>
    {!isEmpty(tokenAddressToMaxAmount) && (<p className="mt-2 text-sm text-gray-500">
      MAX in your wallet
      <span className="ml-1 font-semibold">
        {ceil(maxToken, 2)} {get(tokenAddressToName, tokenAddress)}
      </span>
    </p>)}
  </div>)
}
