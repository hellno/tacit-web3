'use client'
export const dynamic = 'force-dynamic'

// eslint-disable-next-line import/first
import { isEmpty } from 'lodash'
// eslint-disable-next-line import/first
import { useQRCode } from 'next-qrcode'
// eslint-disable-next-line import/first
import { useRouter, useSearchParams } from 'next/navigation'
// eslint-disable-next-line import/first
import { getSiteUrl } from '../../../src/utils'

export default function QR () {
  const claimData = {
    title: 'Great ETHDenver <br />Depositoor Challenge',
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
