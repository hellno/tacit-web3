import { includes, truncate } from 'lodash'
import { useAccount } from 'wagmi'
import WalletConnectButtonForForm from '../components/WalletConnectButtonForForm'
import tinycolor from 'tinycolor2'
import { classNames, connectAddressToReferralCode } from '../utils'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'

export function ClaimReferralRewardComponent ({
  primaryColor,
  onClose
}) {
  const {
    address,
    isConnected
  } = useAccount()
  const [status, setStatus] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const {
    register,
    handleSubmit
  } = useForm()

  const searchParams = useSearchParams()
  const referralCodeInUrl = searchParams.get('code')

  const connectAddressToCode = async (formData) => {
    if (!address || !formData.referralCode) {
      return null
    }
    setStatus('pending')
    setUserMessage('')

    const res = await connectAddressToReferralCode(address, formData.referralCode)

    if (res.status === 200) {
      const responseBody = await res.json()
      setStatus('done')
      if (responseBody.message) {
        setUserMessage(responseBody.message)
      }
    } else if (res.status >= 400 && res.status < 500) {
      console.log('error', res.status, res)
      const responseBody = await res.json()
      setUserMessage(responseBody.message)
      setStatus('error')
    } else {
      console.log('error', res.status, res)
      const responseBody = await res.json()
      setUserMessage(responseBody.message)
      setStatus('error')
    }
  }

  const onSubmit = (formData) => {
    console.log('onSubmit formData', formData)
    switch (status) {
      case 'pending':
        break
      case 'done':
        onClose()
        break
      case '':
      default:
        connectAddressToCode(formData)
    }
  }

  const getButtonText = () => {
    switch (status) {
      case 'pending':
        return '...'
      case 'done':
        return 'Done'
      case '':
      default:
        return 'Enter referral code'
    }
  }

  const primaryColorHover = tinycolor(primaryColor).lighten(10)

  const buttonBgPrimaryColorOnMouseOverEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColorHover
  }

  const buttonBgPrimaryColorOnMouseOutEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColor
  }

  return <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
    <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
      <div className="space-y-6 sm:space-y-5">
        <div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            You’ve been invited to join PoolTogether! <br /><br />
            Enter your fren’s referral code, click "Enter competition", sign the message, then head over to PoolTogether and deposit at least 10USCD on Polygon. The more you deposit, the higher your rank will be on the Top Depositoor leaderboard.
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
              Your fren's referral code
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <input
                {...register('referralCode')}
                type="text"
                name="referralCode"
                id="referralCode"
                defaultValue={referralCodeInUrl}
                className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm sm:max-w-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {includes(['done', 'error'], status) && (
      <div className={classNames(
        status === 'error' ? 'bg-red-50' : 'bg-green-50',
        'rounded-md p-4')}>
        <div className="flex">
          <div className="flex-shrink-0">
            {status === 'error' && <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />}
            {status === 'done' && <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />}
          </div>
          <div className="ml-3">
            <h3 className={classNames(
              status === 'error' ? 'text-red-800' : 'text-green-800',
              'text-sm font-medium')}>
              {status === 'error' ? 'An error occurred' : 'Success - You are registered!'}</h3>
            {userMessage && (<div className={classNames(
              status === 'error' ? 'text-red-700' : 'text-green-700',
              'mt-2 text-sm ')}>
              <p>{userMessage}</p>
            </div>)}
          </div>
        </div>
      </div>)}
    <div className="pt-5">
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={status === 'pending'}
          style={{ backgroundColor: primaryColor }}
          onMouseOver={buttonBgPrimaryColorOnMouseOverEventHandler}
          onMouseOut={buttonBgPrimaryColorOnMouseOutEventHandler}
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  </form>
}
