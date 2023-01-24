'use client'

export default function Leaderboard () {
  // const {
  //   address,
  //   isConnected
  // } = useAccount()

  const accounts = [
    {
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      position: '1',
      value: '123',
      ensName: 'vitalik.eth',
      image:
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      address: '0x36a2ba411848ae2fdac40f117b47c0d7f382d4fb',
      position: '2',
      value: '110',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      address: '0xC93e3d37FCBD498Cb0E12EEACE0099e7372d8a5d',
      position: '3',
      value: '80',
      image: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      address: '0xdd4d117723C257CEe402285D3aCF218E9A8236E1',
      position: '4',
      value: '51',
      image:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      address: '0x0434Ba7f2F795C083bF1f8692acd36721cD34799',
      position: '5',
      value: '12',
      image:
        'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
    // More people...
  ]
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

  const renderTable = () => {
    return (
      <div className="mt-12">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Top Referrers</h1>
            <p className="mt-2 text-sm text-gray-700">
              Overview of users with the most referrals
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Position
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Account
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      # Referrals
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                  {accounts.map((account, index) => (
                    <tr key={account.address}>
                      <td className="whitespace-nowrap py-4 ml-2 pl-4 pr-3 text-sm font-semibold text-gray-600 sm:pl-6">
                        {account.position}.
                      </td>
                      <td className="whitespace-nowrap py-3.5 pl-4 pr-3 text-sm">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full" src={account.image} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-gray-500">{account.ensName || account.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="text-gray-900">{account.value}</div>
                        <div className="text-gray-500">cool person!</div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
              {renderTable()}
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
    </main>
  }

  return renderPageContent()
}
