import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { classNames } from '../src/utils'
import Web3NavBar from '../src/components/Web3NavBar'
import MarkdownComponent from '../src/components/MarkdownComponent'

function ClaimPage () {
  const shareObject = {
    title: 'PoolTogether <br />Referral Program',
    subtitle: 'Have you been referred to PoolTogether? <br /> Claim your reward and give a thank-you to your friend',
    description: 'These are the steps you have to follow to successfully claim your reward:\n1. Click on claim your reward\n2. Follow the instructions\n3. ... \n4. Profit\n\n That\'s it!',
    ownerAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    claimButtonText: 'Claim your reward',
    claimButtonSubtext: ''
  }

  const renderActionButtons = () => {
    const showShareButton = false

    return (
      <div className={classNames(showShareButton && 'md:ml-6', 'mx-auto py-12')}>
        <div className={classNames(showShareButton && 'sm:flex sm:justify-center', 'mt-5 max-w-md md:mx-0 md:mt-8')}>
          <div className="rounded-sm">
            <button
              onClick={() => null}
              className="w-full shadow-sm flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-sm text-white bg-primary hover:bg-primary-light md:py-4 md:text-lg"
            >
              {shareObject.claimButtonText}
            </button>
            {shareObject.claimButtonSubtext && (<span
              className={classNames('md:text-center inline-flex mt-2 pr-4 md:pr-0 text-base font-normal text-gray-600')}>
              {shareObject.claimButtonSubtext}
            </span>)}
          </div>
        </div>
      </div>)
  }

  const bountyDescription = 'yoyoyoyoy bounty description'

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
                <span className="md:block text-primary">
                  <div dangerouslySetInnerHTML={{ __html: shareObject.title }} />
                </span>
              </h1>
              <h3
                className="mt-3 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-2xl lg:mx-0">
                <div dangerouslySetInnerHTML={{ __html: shareObject.subtitle }} />
              </h3>
              <div
                className="sm:px-0 sm:text-center md:max-w-3xl md:mx-auto lg:col-span-6">
                {renderActionButtons()}
              </div>
              <div className="mt-5 text-base text-gray-800 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                <MarkdownComponent content={shareObject.description} />
              </div>
              <div className="lg:max-w-6xl lg:mx-auto">
                <div
                  className="mt-6 inline-flex items-center text-white bg-gray-900 rounded-full p-1 pr-2 sm:text-base lg:text-sm xl:text-base"
                >
                <span
                  className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-secondary rounded-full">
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
                            {shareObject.ownerAddress}
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
          <Web3NavBar />
          {renderPageContent()}
        </div>
      </div>
    </>
  )
}

export default ClaimPage
