import { map, startCase } from 'lodash'

export const renderWalletAddressInputField = (account) => {
  return <input
    type="text"
    name="walletAddress"
    id="walletAddress"
    placeholder="Wallet Address"
    value={account}
    disabled={true}
    className="select-none text-gray-600 mt-1 block w-full shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300 rounded-sm"
  />
}

export const renderFormField = ({
  register,
  name,
  type,
  value = undefined,
  required = false,
  label = '',
  placeholder = ''
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label || startCase(name)}
      </label>
      <input
        {...register(name, { required })}
        type={type}
        name={name}
        id={name}
        autoComplete={name}
        placeholder={placeholder || label || startCase(name)}
        value={value}
        required={required}
        className="text-gray-900 mt-1 block w-full shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300 rounded-sm"
      />
    </div>
  )
}

const renderCurrencyDropdown = ({
  register,
  nameToTokenAddress
}) => {
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

export const renderAmountAndCurrencyFormFields = ({
  register,
  nameToTokenAddress
}) => {
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
        {renderCurrencyDropdown({
          register,
          nameToTokenAddress
        })}
      </div>
    </div>
  </div>)
}
