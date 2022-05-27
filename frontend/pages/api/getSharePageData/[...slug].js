import { ethers } from 'ethers'
import {
  getDeployedContractForChainId,
  getNodeFromContractAsObject,
  getTaskFromContractAsObject,
  taskPortalContractAbi
} from '../../../src/constDeployedContracts'
import { getObjectInIPFS } from '../../../src/storageUtils'
import { isUndefined } from 'lodash'

// eslint-disable-next-line no-unused-vars
const exampleTaskObject = {
  title: 'Looking for a MONOSPACE design agency 👀', // description: '**bold plain markdown** <html> <h1>big title test</h1>  <h3>what is this about</h3><p>a paragraph goes here</p><h3>another heading</h3>more text</html>',
  description: `A nice description of the task with *emphasis* and **strong importance**.

Text with ~strikethrough~ and a URL: https://please-solve-my-task.org.

Not showing this description 100% how I want to, but slowly getting there. 
`,
  bountyAmount: '1000',
  bountyContractAddress: '',
  owner: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
  createdAt: '2022-05-18'
}

export default async function handler (req, res) {
  const {
    query: {
      slug
    }
    // method
  } = req

  console.log('slug is', slug)
  let [shareId, chainId] = slug
  if (isUndefined(shareId) || shareId === 'undefined') {
    res.status(200).json({})
    return
  }

  if (isUndefined(chainId) || chainId === 'undefined') {
    chainId = 5 // 1338 // local
  }

  let provider

  if (process.env.NODE_ENV === 'development' && process.env.USE_LOCAL_NODE === 'true') {
    const url = ' http://127.0.0.1:8545/'
    provider = new ethers.providers.JsonRpcProvider(url)
  } else {
    provider = new ethers.providers.AlchemyProvider('goerli', process.env.ALCHEMY_API_KEY)
  }

  try {
    const { contractAddress } = getDeployedContractForChainId(chainId)
    const taskPortalContract = new ethers.Contract(contractAddress, taskPortalContractAbi, provider)
    const nodesResult = await getNodeFromContractAsObject(taskPortalContract, shareId)
    const { taskPath } = nodesResult
    const taskNodeData = await getTaskFromContractAsObject(taskPortalContract, taskPath)
    const ipfsPath = ethers.utils.toUtf8String(taskNodeData.taskData)

    console.log('ipfsPath', ipfsPath)
    const [cid, fname] = ipfsPath.split('/')
    const taskObject = await getObjectInIPFS(cid, fname)
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const returnPayload = { ...taskObject, ...taskNodeData }
    console.log(returnPayload)
    res.status(200).json(returnPayload)
  } catch (err) {
    console.log('err when getting share data for id', shareId, err)
    res.status(500).json({ error: 'failed to load data' })
  }
}
