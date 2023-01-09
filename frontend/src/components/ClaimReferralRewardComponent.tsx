import { truncate } from 'lodash'
import { useAccount } from 'wagmi'
import WalletConnectButtonForForm from '../components/WalletConnectButtonForForm'
import tinycolor from 'tinycolor2'

export function ClaimReferralRewardComponent ({ primaryColor }) {
  const {
    address,
    isConnected
  } = useAccount()
  const primaryColorHover = tinycolor(primaryColor).lighten(10)

  const buttonBgPrimaryColorOnMouseOverEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColorHover
  }

  const buttonBgPrimaryColorOnMouseOutEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColor
  }

  return <form className="space-y-8 divide-y divide-gray-200">
    <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
      <div className="space-y-6 sm:space-y-5">
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Check your own address and your referrers address to make sure you used those with PoolTogether.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-5">
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Your Address
            </label>
            {!isConnected
              ? <WalletConnectButtonForForm />
              : (<div className="mt-1 sm:col-span-2 sm:mt-0">
                <div className="flex max-w-lg rounded-md shadow-sm">
                  <span
                    className="inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-gray-500 sm:text-sm">
                    {truncate(address, { length: 36 })}
                  </span>
                </div>
              </div>)}
          </div>
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Your referral code
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <input
                type="text"
                name="referralCode"
                id="referralCode"
                className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm sm:max-w-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="pt-5">
      <div className="flex justify-end">
        <button
          type="submit"
          style={{ backgroundColor: primaryColor }}
          onMouseOver={buttonBgPrimaryColorOnMouseOverEventHandler}
          onMouseOut={buttonBgPrimaryColorOnMouseOutEventHandler}
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Claim your reward
        </button>
      </div>
    </div>
  </form>
}
