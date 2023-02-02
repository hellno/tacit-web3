// import { extend, map } from 'lodash'

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
  endDate
}) {
  const headers = {
    'content-type': 'application/json'
  }

  const requestBody = {
    query: `query q($rewardPlanId: UUID!, $startDate: Date!, $endDate: Date!) {
          leaderboard(rewardPlanId: $rewardPlanId, startDate: $startDate, endDate: $endDate, limit: 10) {
            position
            address
            value
          }
        }
        `,
    variables: {
      rewardPlanId,
      startDate,
      endDate
    }
  }

  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  }
  const res = await (await fetch(process.env.GRAPHQL_BACKEND, options)).json()
  console.log('res', res)
  // Recommendation: handle errors
  // if (!res.ok) {
  //   console.log(res)
  //   throw new Error('Failed to fetch data')
  // }
  const { data: { leaderboard } } = res
  // leaderboard = await Promise.all(map(leaderboard, async (element) => {
  //   return extend({}, element, {
  //     ensName: await fetchEnsName({
  //       address: element.address
  //     })
  //   })
  // }
  // ))

  return leaderboard
}

export default async function LeaderboardComponent () {
  const leaderboard = await getLeaderboardData({
    rewardPlanId: 'fec2f259-a76d-4abe-838e-3e1da4684e73',
    startDate: '2023-01-14',
    endDate: '2023-03-01'
  })

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
                      <div className="flex items-center">
                        {account.image && (
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full" src={account.image} alt="" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-gray-500">{account.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="text-gray-900">{Number(account.value).toFixed(2)}</div>
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
