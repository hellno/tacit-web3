'use client'

import { CheckCircleIcon } from '@heroicons/react/24/solid'
import MarkdownComponent from '../../src/components/MarkdownComponent'
import { get } from 'lodash'
import tinycolor from 'tinycolor2'
import { useState } from 'react'
import ModalComponent from '../../src/components/ModalComponent'
import { ClaimReferralRewardComponent } from '../../src/components/ClaimReferralRewardComponent'
import { CreateReferralCodeComponent } from '../../src/components/CreateReferralCodeComponent'

export default function Referral () {
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showReferralCodeModal, setShowReferralCodeModal] = useState(false)

  // Important details
  // Deposits must stay deposited at least until March 6th, 2023 23:59 (UTC)
  // The wallet that has invited the most depositoors wins 80k USDC delegation for a month on Optimism & a championships belt
  // One of the depositoors wins 40k delegation on Polygon for a month – the winner is picked randomly
  const claimData = {
    title: 'Great ETHDenver <br />Depositoor Challenge',
    subtitleClaim: 'PoolyCon and ETHDenver are exceptional opportunities to increase PoolTogether depositooors. Let’s have a competition to see who can bring the most Poolers into the Pool! Both top referrers and top new depositoors win massive prizes – $80K USDC (Optimism) in delegation and $40K USDC (Polygon) in delegation.<br /><br /> ' +
      'This is a competition within the PoolTogether Community and this competition is a way for the protocol to grow organically at ETHDenver 2023. So get your referral code and get as many people as you can to deposit into PoolTogether from Feb 27th until March 6th.<br /><br /> ' +
      'Depositors have until March 6th to deposit $10 or more on Polygon to enter the competition.',
    subtitleReferralCode: 'Create your personal referral code to invite your friends to PoolTogether below',
    description: '**Important details**\n\n' +
      '- Deposits must stay deposited at least until March 6th, 2023 23:59 (UTC) \n' +
      '- The wallet that has invited the most depositoors wins 80k USDC delegation for a month on Optimism & a championships belt \n' +
      '- One of the depositoors wins 40k delegation on Polygon for a month – the winner is picked randomly \n\n\n' +
      'LFG! 🤯💸🥳🌊😎🏆',
    ownerAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    claimButtonText: 'Enter referral code',
    referralCodeButtonText: 'Create referral code',
    brandColor: '#6E3DD9',
    brandImage: '/pooltogether.png',
    brandName: 'PoolTogether'
  }

  const primaryColor = get(claimData, 'brandColor') //  || colors.primary.DEFAULT
  const primaryColorHover = tinycolor(primaryColor).lighten(10)

  const buttonBgPrimaryColorOnMouseOverEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColorHover
  }

  const buttonBgPrimaryColorOnMouseOutEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColor
  }

  const renderActionButtons = () => {
    return (
      <div className="mx-auto pb-12">
        <div
          className="md:flex mt-5 max-w-2xl md:mx-0 md:mt-8">
          <div className="rounded-md shadow">
            <button
              onClick={() => setShowClaimModal(true)}
              style={{ backgroundColor: claimData.brandColor }}
              onMouseOver={buttonBgPrimaryColorOnMouseOverEventHandler}
              onMouseOut={buttonBgPrimaryColorOnMouseOutEventHandler}
              className="w-full shadow-sm flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-light md:py-4 md:text-lg"
            >
              {claimData.claimButtonText}
            </button>
          </div>
          <div className="rounded-md mt-3 shadow sm:mt-0 sm:ml-3">
            <button
              onClick={() => setShowReferralCodeModal(true)}
              style={{ backgroundColor: claimData.brandColor }}
              onMouseOver={buttonBgPrimaryColorOnMouseOverEventHandler}
              onMouseOut={buttonBgPrimaryColorOnMouseOutEventHandler}
              className="w-full shadow-sm flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-light md:py-4 md:text-lg"
            >
              {claimData.referralCodeButtonText}
            </button>
          </div>
        </div>
      </div>)
  }

  function renderPageContent () {
    return <main className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-7xl">
        <div className="lg:grid lg:grid-cols-6 lg:gap-8">
          <div
            className="mx-4 text-left md:max-w-2xl md:mx-auto lg:col-span-6 lg:flex">
            <div>
              <h1
                className="mt-4 text-4xl tracking-tight font-extrabold text-gray-700 sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                <span className="md:block">Welcome to the</span>{' '}
                <span style={{ color: claimData.brandColor }} className="md:block text-primary">
                  <div dangerouslySetInnerHTML={{ __html: claimData.title }} />
                  </span>
              </h1>
              <div
                className="sm:px-0 sm:text-center md:max-w-3xl md:mx-auto lg:col-span-6">
                {renderActionButtons()}
              </div>
              <h3
                className="mt-2 text-base text-gray-800 sm:mt-5 sm:max-w-xl sm:text-xl md:mt-5 md:text-lg lg:mx-0">
                <div
                  dangerouslySetInnerHTML={{ __html: claimData.subtitleClaim }} />
              </h3>
              {/* {renderTabs()} */}
              <div className="mt-5 text-base text-gray-800 sm:mt-5 sm:text-xl md:text-lg">
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

  return <>
    {showClaimModal && (<ModalComponent
      renderContent={() => <ClaimReferralRewardComponent primaryColor={primaryColor}
                                                         onClose={() => setShowClaimModal(false)} />}
      titleText={`Claim your ${claimData.brandName} reward`}
      onClose={() => setShowClaimModal(false)}
      renderCloseButton={false}
    />)}
    {showReferralCodeModal && (<ModalComponent
      renderContent={() => <CreateReferralCodeComponent primaryColor={primaryColor}
                                                        onClose={() => setShowReferralCodeModal(false)} />}
      titleText={`Create your ${claimData.brandName} referral code`}
      onClose={() => setShowReferralCodeModal(false)}
      renderCloseButton={false}
    />)}
    {renderPageContent()}
  </>
}
