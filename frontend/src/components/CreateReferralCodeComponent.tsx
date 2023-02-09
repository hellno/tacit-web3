import { truncate } from 'lodash'
import { useAccount } from 'wagmi'
import WalletConnectButtonForForm from '../components/WalletConnectButtonForForm'
import tinycolor from 'tinycolor2'
import { getReferralCodeForUser, getSiteUrl } from '../utils'
import { useState } from 'react'

export function CreateReferralCodeComponent ({
  primaryColor,
  onClose
}) {
  const {
    address,
    isConnected
  } = useAccount()
  const [referralCode, setReferralCode] = useState(null)
  const [status, setStatus] = useState('')

  const getReferralCode = async () => {
    if (!address) {
      return null
    }
    setStatus('pending')
    const res = await getReferralCodeForUser(address)
    if (res.status === 200) {
      const responseBody = await res.json()
      setReferralCode(responseBody.referralCode)
      setStatus('done')
    } else {
      console.log('error', res)
      setStatus('error')
    }
  }

  const primaryColorHover = tinycolor(primaryColor).lighten(10)

  const buttonBgPrimaryColorOnMouseOverEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColorHover
  }

  const buttonBgPrimaryColorOnMouseOutEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColor
  }

  const getButtonText = () => {
    switch (status) {
      case 'pending':
        return '...'
      case 'done':
        return 'Done'
      case '':
      default:
        return 'Get referral code'
    }
  }

  const onButtonClick = () => {
    switch (status) {
      case 'pending':
        break
      case 'done':
        onClose()
        break
      case '':
      default:
        getReferralCode()
    }
  }

  const referralLink = `${getSiteUrl()}/referral?code=${referralCode}`
  const renderForm = () => <div className="space-y-8 divide-y divide-gray-200">
    <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
      <div className="space-y-6 sm:space-y-5">
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Create your referral code and share it with your friends together with the competition page. <br /><br />
            The more frens you onboard to PoolTogether, the higher your rank will be on the Top Referrer leaderboard.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-5">
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="username" className="block text-md font-medium text-gray-700 sm:mt-px sm:pt-2">
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
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          {referralCode && (<div className="sm:col-span-2">
            <dt className="text-md font-medium text-gray-700">
              Your referral code
            </dt>
            <dd className="mt-1 text-md text-gray-900 truncate underline">
              <a href={referralLink} target="_blank" rel="noopener noreferrer">
                {referralCode}
              </a>
            </dd>
          </div>)}
        </dl>
      </div>
    </div>
    <div className="pt-5">
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={status === 'pending'}
          onClick={() => onButtonClick()}
          style={{ backgroundColor: primaryColor }}
          onMouseOver={buttonBgPrimaryColorOnMouseOverEventHandler}
          onMouseOut={buttonBgPrimaryColorOnMouseOutEventHandler}
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  </div>

  return renderForm()
}
