import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { classNames } from '../src/utils'
import MarkdownComponent from '../src/components/MarkdownComponent'
import { colors } from '../colors'
import { get } from 'lodash'
import tinycolor from 'tinycolor2'
import { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { renderWalletConnectComponent } from '../src/walletUtils'
import Image from 'next/image'
import ModalComponent from '../src/components/ModalComponent'
import { useAccount } from 'wagmi'
import { ClaimReferralRewardComponent } from '../src/components/ClaimReferralRewardComponent'
import { CreateReferralCodeComponent } from '../src/components/CreateReferralCodeComponent'

function ClaimPage () {
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showReferralCodeModal, setShowReferralCodeModal] = useState(false)
  const [showSectionNewUser, setShowSectionNewUser] = useState(true)

  const {
    address,
    isConnected
  } = useAccount()

  const claimData = {
    title: 'PoolTogether <br />Referral Program',
    subtitleClaim: 'Have you been referred to PoolTogether? <br /> Claim your reward and give a thank-you to your friend',
    subtitleReferralCode: 'Create your personal referral code to invite your friends to PoolTogether below',
    description: 'These are the steps you have to follow to successfully claim your reward:\n1. Click on claim your reward\n2. Follow the instructions\n3. ... \n4. Profit\n\n That\'s it!',
    ownerAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    claimButtonText: 'Claim your reward',
    referralCodeButtonText: 'Create your referral code',
    brandColor: '#6E3DD9',
    brandImage: '/pooltogether.png',
    brandName: 'PoolTogether'
  }

  const primaryColor = get(claimData, 'brandColor') || colors.primary.DEFAULT
  const primaryColorHover = tinycolor(primaryColor).lighten(10)

  const buttonBgPrimaryColorOnMouseOverEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColorHover
  }

  const buttonBgPrimaryColorOnMouseOutEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColor
  }


  const renderActionButtons = () => {
    const showShareButton = false

    return (
      <div className={classNames(showShareButton && 'md:ml-6', 'mx-auto pb-12')}>
        <div className={classNames(showShareButton && 'sm:flex sm:justify-center', 'mt-5 max-w-md md:mx-0 md:mt-8')}>
          <div className="rounded-md">
            {showSectionNewUser ? <button
                onClick={() => setShowClaimModal(true)}
                style={{ backgroundColor: claimData.brandColor }}
                onMouseOver={buttonBgPrimaryColorOnMouseOverEventHandler}
                onMouseOut={buttonBgPrimaryColorOnMouseOutEventHandler}
                className="w-full shadow-sm flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-light md:py-4 md:text-lg"
              >
                {claimData.claimButtonText}
              </button>
              : <button
                onClick={() => setShowReferralCodeModal(true)}
                style={{ backgroundColor: claimData.brandColor }}
                onMouseOver={buttonBgPrimaryColorOnMouseOverEventHandler}
                onMouseOut={buttonBgPrimaryColorOnMouseOutEventHandler}
                className="w-full shadow-sm flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-light md:py-4 md:text-lg"
              >
                {claimData.referralCodeButtonText}
              </button>}
          </div>
        </div>
      </div>)
  }

  function renderPageContent () {
    return <main className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-7xl">
        <div className="lg:grid lg:grid-cols-6 lg:gap-8">
          <div
            className="mx-4 md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
            <div>
              <h1
                className="mt-4 text-4xl tracking-tight font-extrabold text-gray-700 sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                <span className="md:block">Welcome to the</span>{' '}
                <span style={{ color: claimData.brandColor }} className="md:block text-primary">
                  <div dangerouslySetInnerHTML={{ __html: claimData.title }} />
                </span>
              </h1>
              <div className="my-16 isolate inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowSectionNewUser(true)}
                  className={classNames(showSectionNewUser ? 'text-white bg-secondary cursor-default border-secondary' : 'text-gray-700 bg-gray-100 hover:bg-gray-50 border-gray-300',
                    'relative inline-flex items-center rounded-l-md border px-5 py-3 text-md font-medium '
                  )}
                >
                  Claim reward
                </button>
                <button
                  type="button"
                  onClick={() => setShowSectionNewUser(false)}
                  className={classNames(!showSectionNewUser ? 'text-white bg-secondary cursor-default border-secondary' : 'text-gray-700 bg-gray-100 hover:bg-gray-50 border-gray-300',
                    'relative -ml-px inline-flex items-center rounded-r-md border px-5 py-3 text-md font-medium'
                  )}
                >
                  Create referral code
                </button>
              </div>
              <h3
                className="mt-2 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-2xl lg:mx-0">
                <div
                  dangerouslySetInnerHTML={{ __html: showSectionNewUser ? claimData.subtitleClaim : claimData.subtitleReferralCode }} />
              </h3>
              <div
                className="sm:px-0 sm:text-center md:max-w-3xl md:mx-auto lg:col-span-6">
                {renderActionButtons()}
              </div>
              <div className="mt-5 text-base text-gray-800 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                <MarkdownComponent content={claimData.description} />
              </div>
              <div className="lg:max-w-6xl lg:mx-auto">
                <div
                  className="mt-6 inline-flex items-center text-white bg-gray-900 rounded-full p-1 pr-2 sm:text-base lg:text-sm xl:text-base"
                >
                <span
                  className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-primary rounded-full">
                  WAGMI
                </span>
                  <span className="ml-4 mr-2 text-sm">
                  Thank you for being here
                </span>
                </div>
                <div className="py-6 md:flex md:items-center">

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div>
                        <dd
                          className="flex items-left text-sm text-gray-400 font-medium sm:mr-6 sm:mt-0">
                          Created by verified account
                          <CheckCircleIcon
                            className="flex-shrink-0 ml-1 mt-0.5 h-4 w-4 text-green-400"
                            aria-hidden="true"
                          />
                        </dd>
                        <div className="flex items-center">
                          <h1
                            className="text-xl font-mediumleading-7 text-gray-800 sm:leading-9 sm:truncate">
                            {claimData.ownerAddress}
                          </h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  }

  return (
    <>
      <div className="relative bg-gray-100 overflow-hidden min-h-screen">
        <div className="relative pt-6 pb-16 sm:pb-24">
          <Popover>
            <nav
              className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6"
              aria-label="Global"
            >
              <div className="flex items-center flex-1">
                <div className="flex items-center justify-between w-full md:w-auto">
                  <span className="sr-only">Tacit</span>
                  <Image
                    className="h-8 w-40 sm:h-10"
                    src={claimData.brandImage}
                    height="56px"
                    width="98px"
                    alt=""
                  />
                  <div className="-mr-2 flex items-center md:hidden">
                    <Popover.Button
                      className="bg-background rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus-ring-inset focus:ring-white">
                      <span className="sr-only">Open main menu</span>
                      <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </Popover.Button>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex">
                {renderWalletConnectComponent()}
              </div>
            </nav>
            <Transition
              as={Fragment}
              enter="duration-150 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-100 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Popover.Panel
                focus
                className="absolute z-10 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
              >
                <div className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5">
                  <div className="px-5 py-2 flex items-center justify-between">
                    <div className="block w-full">
                      {renderWalletConnectComponent()}
                    </div>
                    <div className="-mr-2">
                      <Popover.Button
                        className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-100 focus:outline-none">
                        <span className="sr-only">Close menu</span>
                        <XMarkIcon className="h-7 w-7" aria-hidden="true" />
                      </Popover.Button>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>
          {showClaimModal && (<ModalComponent
            renderContent={() => <ClaimReferralRewardComponent primaryColor={primaryColor} />}
            titleText={`Claim your ${claimData.brandName} reward`}
            onClose={() => setShowClaimModal(false)}
            renderCloseButton={false}
          />)}
          {showReferralCodeModal && (<ModalComponent
            renderContent={() => <CreateReferralCodeComponent primaryColor={primaryColor} onClose={() => setShowReferralCodeModal(false)}/>}
            titleText={`Create your ${claimData.brandName} referral code`}
            onClose={() => setShowReferralCodeModal(false)}
            renderCloseButton={false}
          />)}
          {renderPageContent()}
        </div>
      </div>
    </>
  )
}

export default ClaimPage
