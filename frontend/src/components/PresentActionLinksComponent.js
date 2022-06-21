import { AppContext } from '../context'
import { useContext } from 'react'
import { getDeployedContractForChainId } from '../constDeployedContracts'

const PresentActionLinksComponent = ({
  data
}) => {
  // state = {
  //   name: CreateTaskState.DoneCreatingTask,
  //   data: {
  //     transactionHash: '0xdef97bea1c68deea54ee7daccb31be59bbfd10488b8814b3d22a9651cc74b7c6',
  //     taskPath: '0x58e74df8c68655e9430d118e0f569aed199b93dcc42d0f2da863b0e38529ac55'
  //   }
  // }

  const [state] = useContext(AppContext)
  const {
    network
  } = state

  const shortNameForChain = getDeployedContractForChainId(network.chainId).shortName
  const blockExplorerForChain = getDeployedContractForChainId(network.chainId).blockExplorer

  const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://web3.tacit.so'
  const taskShareLink = `${url}/share/${shortNameForChain}:${data.sharePath}`
  const transactionLink = `${blockExplorerForChain}/tx/${data.transactionHash}`
  const userTasksLink = `${url}/task/${shortNameForChain}:${data.taskPath}`

  return (<>
    <div className="mt-6">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        {data.sharePath && (<div className="sm:col-span-2">
          <dt className="text-md font-medium text-gray-500">
            Your search task link for your friends
          </dt>
          <dd className="mt-1 text-md text-gray-900 truncate underline">
            <a href={taskShareLink} target="_blank" rel="noopener noreferrer">
              {taskShareLink}
            </a>
          </dd>
        </div>)}
        {data.transactionHash && (<div className="sm:col-span-2">
          <dt className="text-md font-medium text-gray-500">Your transaction
            <span
              className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                takes few mins to update
              </span></dt>
          <dd className="mt-1 text-md text-gray-900 truncate underline">
            <a href={transactionLink} target="_blank" rel="noopener noreferrer">
              {transactionLink}
            </a>
          </dd>
        </div>)}
        {data.taskPath && (<div className="sm:col-span-2">
          <dt className="text-md font-medium text-gray-500">
            Dashboard for task and bounty
            {/* <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"> */}
            {/*     Not Live Yet */}
            {/*   </span> */}
          </dt>
          <dd className="mt-1 text-md text-gray-900 truncate underline">
            <a href={userTasksLink} target="_blank" rel="noopener noreferrer">
              {userTasksLink}
            </a>
          </dd>
        </div>)}
        {data.taskPath && (<div className="sm:col-span-2">
          <dt className="text-md font-medium text-gray-500">Task hash</dt>
          <dd className="mt-1 text-md text-gray-900 truncate">{data.taskPath}</dd>
        </div>)}
        {data.sharePath && (<div className="sm:col-span-2">
          <dt className="text-md font-medium text-gray-500">What can you do now?!</dt>
          <dd className="mt-1 text-md text-gray-900">
            Share your search task link with your community and friends on Twitter, Disord, Whatsapp, mail… wherever you
            want. Lean back and check your dashboard for results. ☕️
          </dd>
        </div>)}
      </dl>
    </div>
  </>)
}

export default PresentActionLinksComponent
