import { assign, get, map, take } from 'lodash'

// const config = {
//   apiKey: process.env.ALCHEMY_API_KEY,
//   network: Network.POLYGON
// }
// const alchemy = new Alchemy(config)
// const ensContractAddress = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'
//
// function getENSNameForAddress (address) {
//   const nfts = await alchemy.nft.getNftsForOwner(address, {
//     contractAddresses: [ensContractAddress]
//   })
// }

async function getLeaderboardData ({
  rewardPlanId,
  startDate,
  endDate,
  isReferral
}) {
  const headers = {
    'content-type': 'application/json'
  }

  const requestBody = {
    query: `query q($rewardPlanId: UUID!, $startDate: Date!, $endDate: Date!, $isReferral: Boolean) {
          leaderboard(rewardPlanId: $rewardPlanId, startDate: $startDate, endDate: $endDate, isReferral: $isReferral) {
            position
            address
            value
          }
        }
        `,
    variables: {
      rewardPlanId,
      startDate,
      endDate,
      isReferral
    }
  }

  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    next: {
      revalidate: 120 // refetch every 2mins
    }
  }
  const res = await (await fetch(process.env.GRAPHQL_BACKEND, options)).json()
  // Recommendation: handle errors
  // if (!res.ok) {
  //   console.log(res)
  //   throw new Error('Failed to fetch data')
  // }
  const { data } = res
  const leaderboard = map(data.leaderboard, (entry) => {
    const p = JSON.parse(entry.value)
    return assign(entry,
      { balance: p.balance },
      { count: get(p, 'count', 0) }
    )
  })

  // [...slug] = await Promise.all(map([...slug], async (element) => {
  //   return extend({}, element, {
  //     ensName: await fetchEnsName({
  //       address: element.address
  //     })
  //   })
  // }
  // ))

  return leaderboard
}

export default async function LeaderboardTableComponent ({
  title,
  subtitle,
  isReferral
}) {
  let leaderboard = await getLeaderboardData({
    rewardPlanId: 'fec2f259-a76d-4abe-838e-3e1da4684e73',
    startDate: '2023-01-14',
    endDate: '2023-03-06',
    isReferral: isReferral
  })

  leaderboard = take(leaderboard, 25)

  return (
    <div className="">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          {title && (<h1 className="text-xl font-semibold text-gray-900">{title}</h1>)}
          {subtitle && (<p className="mt-2 text-sm text-gray-700">
            {subtitle}
          </p>)}
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Position
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Account
                  </th>
                  {isReferral && (
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      # Referrals
                    </th>
                  )}
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Staked USDC
                  </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {leaderboard.map((account, index) => (
                  <tr key={account.address}>
                    <td className="whitespace-nowrap py-4 ml-2 pl-4 pr-3 text-sm font-semibold text-gray-600 sm:pl-6">
                      {account.position}.
                    </td>
                    <td className="whitespace-nowrap py-3.5 pl-4 pr-3 text-sm">
                      <a href={`https://polygonscan.com/address/${account.address}`}
                         target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center">
                          {account.image && (
                            <div className="h-10 w-10 flex-shrink-0 mr-4">
                              <img className="h-10 w-10 rounded-full" src={account.image} alt="" />
                            </div>
                          )}
                          <div className="">
                            <div className="text-gray-500">{account.address}</div>
                          </div>
                        </div>
                      </a>
                    </td>
                    {isReferral && (
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="text-gray-900">{account.count}</div>
                      </td>
                    )}
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="text-gray-900">{Number(account.balance).toFixed(2)}</div>
                      {/* <div className="text-gray-500">cool person!</div> */}
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
