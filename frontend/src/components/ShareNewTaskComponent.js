import { AppContext } from '../context'
import { useContext } from 'react'

const ShareNewTaskComponent = ({
  state
}) => {
  const [globalState] = useContext(AppContext)

  // state = {
  //   name: CreateTaskState.DoneCreatingTask,
  //   data: {
  //     transactionHash: '0xdef97bea1c68deea54ee7daccb31be59bbfd10488b8814b3d22a9651cc74b7c6',
  //     taskPath: '0x58e74df8c68655e9430d118e0f569aed199b93dcc42d0f2da863b0e38529ac55'
  //   }
  // }

  const blockExplorerForChain = 'https://goerli.etherscan.io'

  const taskShareLink = `/share/${state.data.sharePath}`
  const transactionLink = `${blockExplorerForChain}/tx/${state.data.transactionHash}`
  const userTasksLink = `/tasks/${globalState.account}`

  return (<>
    <div className="px-4 py-8 sm:px-10">
      <div className="mt-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-md font-medium text-gray-500">Your share-able link</dt>
            <dd className="mt-1 text-md text-gray-900 truncate underline">
              <a href={taskShareLink} target="_blank" rel="noopener noreferrer">
                {taskShareLink}
              </a>
            </dd>
          </div>
          <div className="sm:col-span-2">
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
          </div>
          <div className="sm:col-span-2">
            <dt className="text-md font-medium text-gray-500">
              See all your tasks
              <span
                className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Not Live Yet
              </span>
            </dt>
            <dd className="mt-1 text-md text-gray-900 truncate underline">
              <a href={userTasksLink} target="_blank" rel="noopener noreferrer">
                {userTasksLink}
              </a>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-md font-medium text-gray-500">Task hash</dt>
            <dd className="mt-1 text-md text-gray-900 truncate">{state.data.taskPath}</dd>
          </div>
          {/* <div className="sm:col-span-1"> */}
          {/*   <dt className="text-sm font-medium text-gray-500">Salary expectation</dt> */}
          {/*   <dd className="mt-1 text-sm text-gray-900">$120,000</dd> */}
          {/* </div> */}
          <div className="sm:col-span-2">
            <dt className="text-md font-medium text-gray-500">What can you do now?!</dt>
            <dd className="mt-1 text-md text-gray-900">
              Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat.
              Excepteur
              qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure
              nostrud
              pariatur mollit ad adipisicing reprehenderit deserunt qui eu.
            </dd>
          </div>
        </dl>
      </div>
    </div>
    <div className="px-4 py-6 bg-gray-50 border-t-2 border-gray-200 sm:px-10">
      <p className="text-xs leading-5 text-gray-500">
        Thank you for being early (🫡, 🫡)
      </p>
    </div>
  </>)
}

export default ShareNewTaskComponent
