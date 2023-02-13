'use client'

import { get, isEmpty } from 'lodash'
import tinycolor from 'tinycolor2'
import { useQRCode } from 'next-qrcode'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSiteUrl } from '../../../src/utils'

export default function QR () {
  const claimData = {
    title: 'Great ETHDenver <br />Depositoor Challenge',
    subtitleClaim: 'PoolyCon and ETHDenver are exceptional opportunities to increase PoolTogether depositooors. Let’s have a competition to see who can bring the most Poolers into the Pool! Both top referrers and top new depositoors win massive prizes – 80 USDC (Optimism) and 40k USDC (Polygon) in delegation.<br /><br /> ' +
      'This is a competition within the PoolTogether Community and this competition is a way for the protocol to grow organically at ETHDenver 2023. So get your referral code and get as many people as you can to deposit into PoolTogether from Feb 27th until March 6th.<br /><br /> ' +
      'Depositors have until March 6th to deposit $10 or more on Polygon to enter the competition.',
    subtitleReferralCode: 'Create your personal referral code to invite your friends to PoolTogether below',
    description: '**Important details**\n\n' +
      '- Deposits must stay deposited at least until March 6th, 2023 23:59 (UTC)\n' +
      '- The top 4 referrers win 20k USDC (Optimism) in delegation each. \n' +
      '- The top 4 depositoors win 10k USDC (Polygon) in delegation each. \n\n\n' +
      'LFG! 🤯💸🥳🌊😎🏆',
    ownerAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    claimButtonText: 'Enter referral code',
    referralCodeButtonText: 'Create referral code',
    brandColor: '#6E3DD9',
    brandImage: '/pooltogether.png',
    brandName: 'PoolTogether'
  }
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  if (isEmpty(code)) {
    router.push('/404')
  }
  const referralLink = `${getSiteUrl()}/referral?code=${code}`

  const primaryColor = get(claimData, 'brandColor') //  || colors.primary.DEFAULT
  const primaryColorHover = tinycolor(primaryColor).lighten(10)

  const buttonBgPrimaryColorOnMouseOverEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColorHover
  }

  const buttonBgPrimaryColorOnMouseOutEventHandler = (event: any) => {
    event.target.style.backgroundColor = primaryColor
  }
  const {
    Image
  } = useQRCode()
  const renderQrCode = () => {
    return (
      <Image
        text={referralLink}
        logo={{
          src: 'https://pooltogether.com/favicon.png',
          options: {
            // width: 35,
            // x: 58,
            // y: 58
          }
        }}
        options={{
          level: 'high',
          margin: 0,
          scale: 1,
          width: 250,
          color: {
            dark: claimData.brandColor
            // light: '#FFBF60FF'
          }
        }}
      />
    )
  }

  return <main className="mt-16 sm:mt-24">
    <div className="mx-auto max-w-7xl">
      <div className="lg:grid lg:grid-cols-6 lg:gap-8">
        <div
          className="mx-4 text-left md:max-w-2xl md:mx-auto lg:col-span-6 lg:flex">
          <div>
            <h1
              className="mt-4 text-4xl tracking-tight font-extrabold text-gray-700 sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
              <span className="md:block">This is your<br />QR Code for the</span>{' '}
              <span style={{ color: claimData.brandColor }} className="md:block text-primary">
                  <div dangerouslySetInnerHTML={{ __html: claimData.title }} />
                  </span>
            </h1>
            <div className="my-12">
            </div>
            <div className="lg:max-w-6xl lg:mx-auto">
              <div className="py-8 md:flex md:items-center">
                {renderQrCode()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
}
