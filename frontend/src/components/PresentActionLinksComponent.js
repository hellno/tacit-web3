import { AppContext } from '../context'
import { useContext } from 'react'
import { getDeployedContractForChainId } from '../constDeployedContracts'
import { getSitePathForNode, getSiteUrl } from '../utils'

const PresentActionLinksComponent = ({
  data
}) => {
  const [state] = useContext(AppContext)
  const {
    network
  } = state

  const blockExplorerForChain = getDeployedContractForChainId(network.chainId).blockExplorer
  const transactionLink = `${blockExplorerForChain}/tx/${data.transactionHash}`

  const taskShareLink = `${getSiteUrl()}/${getSitePathForNode({
    nodeType: 'share',
    chainId: network.chainId,
    path: data.sharePath
  })}`
  const userTasksLink = `${getSiteUrl()}/${getSitePathForNode({
    nodeType: 'task',
    chainId: network.chainId,
    path: data.taskPath
  })}`

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
