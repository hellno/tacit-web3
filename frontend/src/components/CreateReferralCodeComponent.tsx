import { includes, split } from 'lodash'
import { useAccount, useBalance } from 'wagmi'
import WalletConnectButtonForForm from '../components/WalletConnectButtonForForm'
import tinycolor from 'tinycolor2'
import { classNames, getReferralCodeForUser, getSiteUrl } from '../utils'
import { useState } from 'react'
import { DocumentDuplicateIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/shift-away.css'
import Tippy from '@tippyjs/react'
import { TelegramIcon, TelegramShareButton } from 'next-share'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'

const DEFAULT_TOOLTIP_CONTENT = 'Click to copy'

export function CreateReferralCodeComponent ({
  primaryColor,
  onClose
}: {
  primaryColor: string,
  onClose: () => void
}) {
  const {
    address,
    isConnected
  } = useAccount()

  const {
    data,
    isSuccess
  } = useBalance({
    token: '0x6a304dfdb9f808741244b6bfee65ca7b3b3a6076', // ptUSDC
    address,
    chainId: 137 // polygon
  })
  const noStakedUsdc = data?.formatted === '0.0'
  const [referralCode, setReferralCode] = useState('')
  const [status, setStatus] = useState('')
  const [tooltipContent, setTooltipContent] = useState(DEFAULT_TOOLTIP_CONTENT)
  const [isUrlCopied, setIsUrlCopied] = useState(false)
  const [isCodeCopied, setIsCodeCopied] = useState(false)
  const [userMessage, setUserMessage] = useState('')

  const handleLinkCopyClick = (url) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(url)
        .then(_ => {
          setTooltipContent('Copied link!')
          setIsUrlCopied(true)
          setIsCodeCopied(false)
        })
    }
  }
  const handleCodeCopyClick = (url) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(url)
        .then(_ => {
          setTooltipContent('Copied code!')
          setIsUrlCopied(false)
          setIsCodeCopied(true)
        })
    }
  }

  const getReferralCode = async () => {
    if (!address || noStakedUsdc) {
      return null
    }
    setStatus('pending')
    const res = await getReferralCodeForUser(address)
    if (res.status === 200) {
      const responseBody = await res.json()
      setReferralCode(responseBody.referralCode)
      setStatus('done')
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
        return 'Awesome, thanks!'
      case '':
      default:
        return 'Create referral code'
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

  const site = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://pool.tacit.so'
  const referralLink = `${site}/referral?code=${referralCode}`

  const renderForm = () => (
    <div>
      <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div className="space-y-6 sm:space-y-5">
          <div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Create your referral code and share it with your friends together with the competition page. <br /><br />
              The more frens you onboard to PoolTogether, the higher your rank will be on the Top Referrer leaderboard.
            </p>
          </div>
          <div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {isSuccess && (
                <>
                <span>
                  Your staked USDC balance in PoolTogether on Polygon: {data?.formatted}
                </span>
                  {noStakedUsdc && <span>
                    <br />
                  You must have staked 10 USDC in PoolTogether to create your referral code
                </span>}
                </>
              )}
            </p>
          </div>

          <div className="space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-2 sm:items-start sm:gap-2 sm:border-b sm:border-gray-200 sm:pb-5">
              <label htmlFor="username" className="block text-md font-medium text-gray-700 sm:mt-px">
                Your Address
              </label>
              {!isConnected
                ? <WalletConnectButtonForForm />
                : (<div className="mt-1 sm:col-span-2 sm:mt-0">
                  <div className="flex max-w-lg">
                  <span
                    className="inline-flex items-center rounded-md shadow-sm border border-gray-300 bg-gray-50 px-3 py-1.5 text-gray-500 sm:text-sm">
                    {address}
                    {/* {truncate(address, { length: 36 })} */}
                  </span>
                  </div>
                </div>)}
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            {referralCode && (
              <div className="sm:col-span-2">
                <dt className="text-md font-medium text-gray-700">
                  Your Referral Link
                </dt>
                {/* <dd className="flex mt-1 text-md text-gray-900 bg-gray-100 rounded-md"> */}
                {/*   <a href={referralLink} target="_blank" rel="noopener noreferrer" */}
                {/*      className="px-3 py-2"> */}
                {/*     {referralLink} */}
                {/*   </a> */}
                {/*   <br /> */}
                {/* </dd> */}
                <div className="relative mt-1 flex items-center max-w-lg">
                  <input
                    type="text"
                    name="referralLink"
                    id="referralLink"
                    disabled
                    value={split(referralLink, '//')[1]}
                    className="block w-full rounded-md bg-gray-50 border-gray-300 pr-12 shadow-sm sm:text-sm"
                  />
                  <Tippy
                    hideOnClick={false}
                    animation="shift-away"
                    content={isUrlCopied ? tooltipContent : DEFAULT_TOOLTIP_CONTENT}
                  >
                    <button className="absolute inset-y-0 right-0 flex py-1 pr-1"
                            onClick={() => handleLinkCopyClick(referralLink)}
                    >
                      <kbd
                        className="bg-white hover:bg-white inline-flex items-center rounded border border-gray-200 px-2 py-1.5 font-sans text-sm font-medium text-gray-500 focus:ring-1 focus:ring-gray-500 focus:border-gray-500">
                        <DocumentDuplicateIcon className="block h-4 w-4" aria-hidden="true" />
                      </kbd>
                    </button>
                  </Tippy>
                </div>
                <dt className="mt-4 text-md font-medium text-gray-700">
                  Your Referral Code
                </dt>
                <div className="relative mt-1 flex items-center">
                  <input
                    type="text"
                    name="referralLink"
                    id="referralLink"
                    disabled
                    value={referralCode}
                    className="block w-full rounded-md bg-gray-50 border-gray-300 pr-12 shadow-sm sm:text-sm"
                  />
                  <Tippy
                    hideOnClick={false}
                    animation="shift-away"
                    content={isCodeCopied ? tooltipContent : DEFAULT_TOOLTIP_CONTENT}
                  >
                    <button className="absolute inset-y-0 right-0 flex py-1 pr-1"
                            onClick={() => handleCodeCopyClick(referralCode)}
                    >
                      <kbd
                        className="bg-white hover:bg-white inline-flex items-center rounded border border-gray-200 px-2 py-1.5 font-sans text-sm font-medium text-gray-500 focus:ring-1 focus:ring-gray-500 focus:border-gray-500">
                        <DocumentDuplicateIcon className="block h-4 w-4" aria-hidden="true" />
                      </kbd>
                    </button>
                  </Tippy>
                </div>
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-700">Share</h3>
                  <ul role="list" className="mt-2 flex items-center space-x-6">
                    <li>
                      <a href="discord:///"
                         className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Share on Discord</span>
                        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 127.14 96.36">
                          <g id="Discord_Logos" data-name="Discord Logos">
                            <g id="Discord_Logo_-_Large_-_White" data-name="Discord Logo - Large - White">
                              <path className="cls-1"
                                    d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                            </g>
                          </g>
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a
                        href={`https://twitter.com/messages/compose?text=Join the Depositooor Challenge at PoolTogether: ${referralLink}`}
                        className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Share on Twitter</span>
                        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <div
                        className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500">
                        <TelegramShareButton url={referralLink}>
                          <span className="sr-only">Share via Telegram</span>
                          <TelegramIcon size={24} round />
                        </TelegramShareButton>
                      </div>
                    </li>
                    <li>
                      <div
                        className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500">
                        <a href={`https://api.whatsapp.com/send?text=${referralLink}`}
                           target="_blank" rel="noopener noreferrer"
                           className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500">
                          <span className="">via WhatsApp</span>
                        </a>
                      </div>
                    </li>
                    <li>
                      <a href={`${getSiteUrl()}/referral/qr?code=${referralCode}`}
                         target="_blank" rel="noopener noreferrer"
                         className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Share via QR Code</span>
                        <QrCodeIcon className="h-5 w-5" aria-hidden="true" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>)}
          </dl>
        </div>
      </div>
      {
        includes(['error'], status) && (
          <div className={classNames(
            status === 'error' ? 'bg-red-50' : 'bg-green-50 mt-4',
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
                  {status === 'error' ? 'An error occurred' : 'Success!'}</h3>
                {userMessage && (<div className={classNames(
                  status === 'error' ? 'text-red-700' : 'text-green-700',
                  'mt-2 text-sm ')}>
                  <p>{userMessage}</p>
                </div>)}
              </div>
            </div>
          </div>)
      }
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
  )

  return renderForm()
}
