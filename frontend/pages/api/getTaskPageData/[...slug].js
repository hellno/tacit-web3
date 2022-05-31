import { ethers } from 'ethers'
import {
  getDeployedContractForChainId,
  getNodeFromContractAsObject,
  getTaskFromContractAsObject,
  taskPortalContractAbi
} from '../../../src/constDeployedContracts'
import { getObjectInIPFS } from '../../../src/storageUtils'
import { isUndefined, map } from 'lodash'

const useLocalNode = process.env.USE_LOCAL_NODE === 'true'

export default async function handler (req, res) {
  const {
    query: {
      slug
    }
    // method
  } = req

  console.log('slug is', slug)
  let [taskId, chainId] = slug
  if (isUndefined(taskId) || taskId === 'undefined') {
    res.status(200).json({})
    return
  }

  if (isUndefined(chainId) || chainId === 'undefined') {
    chainId = useLocalNode ? 1337 : 5
  }

  let provider

  if (process.env.NODE_ENV === 'development' && useLocalNode) {
    const url = 'http://127.0.0.1:8545/'
    provider = new ethers.providers.JsonRpcProvider(url)
  } else {
    provider = new ethers.providers.AlchemyProvider('goerli', process.env.ALCHEMY_API_KEY)
  }

  try {
    const { contractAddress } = getDeployedContractForChainId(chainId)
    // console.log('chainId', chainId, 'contractAddress', contractAddress)
    const taskPortalContract = new ethers.Contract(contractAddress, taskPortalContractAbi, provider)

    const taskNodeData = await getTaskFromContractAsObject(taskPortalContract, taskId)
    const ipfsPath = ethers.utils.toUtf8String(taskNodeData.taskData)
    const [cid, fname] = ipfsPath.split('/')
    const taskObject = await getObjectInIPFS(cid, fname)
    const nestedNodesObject = await getRecursiveNodes(taskPortalContract, taskId)
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const returnPayload = { ...taskObject, ...taskNodeData, ...nestedNodesObject }
    console.log(returnPayload)
    res.status(200).json(returnPayload)
  } catch (err) {
    console.log('err when getting share data for id', taskId, err)
    res.status(500).json({ error: 'failed to load data' })
  }
}

const getRecursiveNodes = async (contract, nodePath) => {
  const nodeObject = await getNodeFromContractAsObject(contract, nodePath)
  if (nodeObject.nodes.length > 0) {
    nodeObject.nodes = await Promise.all(map(nodeObject.nodes, async (path) =>
      await getRecursiveNodes(contract, path))
    )
  }
  nodeObject.path = nodePath
  return nodeObject
}
