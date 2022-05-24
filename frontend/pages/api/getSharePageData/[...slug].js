import { ethers } from 'ethers'
import {
  contractABI,
  getDeployedContractForChainId,
  getTaskFromContractAsObject
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
      // chainId
    }
    // method
  } = req

  console.log('slug is', slug)
  // const [shareId, chainId] = slug
  const [shareId] = slug
  if (isUndefined(shareId) || shareId === 'undefined') {
    res.status(200).json({})
  }

  const chainId = 5 // 1338 // local
  console.log('shareId')
  try {
    // const network = ' http://127.0.0.1:8545/'
    // const provider = new ethers.providers.JsonRpcProvider(network)
    const network = {
      name: 'goerli',
      chainId: 5
    }
    const provider = new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_API_KEY)

    // Signer
    const signer = new ethers.Wallet(process.env.STAGING_PRIVATE_KEY, provider)
    // const signer = VoidSigner('0x5fbdb2315678afecb367f032d93f642f64180aa3', provider)

    const { contractAddress } = getDeployedContractForChainId(chainId)
    const taskPortalContract = new ethers.Contract(contractAddress, contractABI, signer)
    const nodesResult = await taskPortalContract.getNode(shareId)
    console.log('response from getNode with shareId', nodesResult)
    const { taskPath } = nodesResult
    const taskNodeData = await getTaskFromContractAsObject(taskPortalContract, taskPath)
    // const taskNodeResult = await taskPortalContract.getTask(taskPath)
    console.log('taskNodeData', taskNodeData)
    const ipfsPath = ethers.utils.toUtf8String(taskNodeData.taskData)
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
