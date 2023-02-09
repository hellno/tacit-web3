import LeaderboardTableComponent from '../../../src/components/LeaderboardTableComponent'
import React from 'react'
import { classNames } from '../../../src/utils'
import Link from 'next/link'

const claimData = {
  title: 'PoolTogether <br />Referral Leaderboard',
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

export default async function Leaderboard ({
  params
}: {
  params: { slug: string[] };
}) {
  const { slug } = params
  const page = slug[slug.length - 1]
  const tabs = [
    {
      name: 'Top Referrers',
      href: '/referral/leaderboard/top',
      current: page === 'top'
    },
    {
      name: 'Highest Stakers',
      href: '/referral/leaderboard/stakers',
      current: page === 'stakers'
    }
  ]
  const renderTabs = () => (
    <div>
      {/* <div className="sm:hidden"> */}
      {/*   <label htmlFor="tabs" className="sr-only"> */}
      {/*     Select a tab */}
      {/*   </label> */}
      {/*   /!* Use an "onChange" listener to redirect the user to the selected tab URL. *!/ */}
      {/*   <select */}
      {/*     id="tabs" */}
      {/*     name="tabs" */}
      {/*     style={{ borderColor: claimData.brandColor }} */}
      {/*     className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" */}
      {/*     defaultValue={tabs.find((tab) => tab.current).name} */}
      {/*   > */}
      {/*     {tabs.map((tab) => ( */}
      {/*       <option key={tab.name}>{tab.name}</option> */}
      {/*     ))} */}
      {/*   </select> */}
      {/* </div> */}
      <div className="">
        <nav className="isolate flex divide-x divide-gray-200 rounded-lg shadow" aria-label="Tabs">
          {tabs.map((tab, tabIdx) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={classNames(
                tab.current ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
                tabIdx === 0 ? 'rounded-l-lg' : '',
                tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10'
              )}
              aria-current={tab.current ? 'page' : undefined}
            >
              <span>{tab.name}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  tab.current ? 'bg-indigo-500' : 'bg-transparent',
                  'absolute inset-x-0 bottom-0 h-0.5'
                )}
              />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )

  const renderLeaderboardForTab = () => {
    switch (page) {
      case 'top':
        // @ts-ignore
        return <LeaderboardTableComponent
          title=""
          subtitle="Overview of users with the most referrals"
          isReferral
        />
      case 'stakers':
        // @ts-ignore
        return <LeaderboardTableComponent
          title=""
          subtitle="Overview of users with the highest stakes"
        />
      default:
        return null
    }
  }

  // @ts-ignore
  return (<main className="mt-16 sm:mt-24">
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
            <div className="mt-12">
              {renderTabs()}
              {renderLeaderboardForTab()}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>)
}
