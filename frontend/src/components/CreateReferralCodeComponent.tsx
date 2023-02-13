import { split } from 'lodash'
import { useAccount } from 'wagmi'
import WalletConnectButtonForForm from '../components/WalletConnectButtonForForm'
import tinycolor from 'tinycolor2'
import { getReferralCodeForUser, getSiteUrl } from '../utils'
import { useState } from 'react'
import { DocumentDuplicateIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/shift-away.css'
import Tippy from '@tippyjs/react'
import { TelegramIcon, TelegramShareButton, WhatsappIcon, WhatsappShareButton } from 'next-share'

export function CreateReferralCodeComponent ({
  primaryColor,
  onClose
}) {
  const {
    address,
    isConnected
  } = useAccount()
  const [referralCode, setReferralCode] = useState('')
  const [status, setStatus] = useState('')
  const [tooltipContent, setTooltipContent] = useState('Click to copy')
  const [, setIsUrlCopied] = useState(false)

  const handleLinkCopyClick = (url) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(url)
        .then(_ => {
          setTooltipContent('Copied!')
          setIsUrlCopied(true)
        })
    }
  }

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
          <div className="sm:grid sm:grid-cols-2 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
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
              <div className="relative mt-1 flex items-center">
                <input
                  type="text"
                  name="referralLink"
                  id="referralLink"
                  disabled
                  value={split(referralLink, '//')[1]}
                  className="block w-full rounded-md border-gray-300 pr-12 shadow-sm sm:text-sm"
                />
                <Tippy
                  hideOnClick={false}
                  animation="shift-away"
                  content={tooltipContent}
                >
                  <button className="absolute inset-y-0 right-0 flex py-1 pr-1"
                          onClick={() => handleLinkCopyClick(referralLink)}
                  >
                    <kbd
                      className="inline-flex items-center rounded border border-gray-200 px-2 py-1.5 font-sans text-sm font-medium text-gray-800 hover:bg-gray-200 focus:ring-1 focus:ring-gray-500 focus:border-gray-500">
                      <DocumentDuplicateIcon className="block h-4 w-4" aria-hidden="true" />
                    </kbd>
                  </button>
                </Tippy>
              </div>
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-700">Share</h3>
                <ul role="list" className="mt-4 flex items-center space-x-6">
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
                    <a href={`https://www.facebook.com/share.php?u=${referralLink}`}
                       className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Share on Facebook</span>
                      <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="https://instagram.com"
                       className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Share on Instagram</span>
                      <svg className="h-6 w-6" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fillRule="evenodd"
                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                          clipRule="evenodd"
                        />
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
                        <TelegramIcon size={32} round />
                      </TelegramShareButton>
                    </div>
                  </li>
                  <li>
                    <div
                      className="flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-500">
                      <WhatsappShareButton url={referralLink}>
                        <span className="sr-only">Share via WhatsApp</span>
                        <WhatsappIcon size={32} round />
                      </WhatsappShareButton>
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
