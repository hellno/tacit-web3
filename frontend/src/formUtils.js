import { startCase } from 'lodash'

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
