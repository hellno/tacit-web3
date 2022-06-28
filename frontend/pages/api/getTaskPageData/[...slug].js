import { ethers } from 'ethers'
import {
  getChainIdFromShortName,
  getDeployedContractForChainId,
  getNodeFromContractAsObject,
  getTaskFromContractAsObject,
  taskPortalContractAbi
} from '../../../src/constDeployedContracts'
import { getObjectInIPFS } from '../../../src/storageUtils'
import { map, split } from 'lodash'
import { getProviderForChainId } from '../../../src/apiUtils'

export default async function handler (req, res) {
  const { slug } = req.query

  console.log('slug is', slug)
  const [chainShortName, taskId] = split(slug, ':')
  const chainId = getChainIdFromShortName(chainShortName)
  const provider = getProviderForChainId(chainId)

  try {
    const { contractAddress } = getDeployedContractForChainId(chainId)
    const taskPortalContract = new ethers.Contract(contractAddress, taskPortalContractAbi, provider)

    const taskNodeData = await getTaskFromContractAsObject(taskPortalContract, taskId)
    const ipfsPath = ethers.utils.toUtf8String(taskNodeData.taskData)
    const [cid, fname] = ipfsPath.split('/')

    const taskObject = await getObjectInIPFS(cid, fname)
    const nestedNodesObject = await getRecursiveNodes(taskPortalContract, taskId)
    const returnPayload = {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...taskObject, // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...taskNodeData, // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...nestedNodesObject,
      chainId
    }
    res.status(200).json(returnPayload)
  } catch (err) {
    console.log('err when getting task page data for id', taskId, err)
    res.status(500).json({ error: 'failed to load data' })
  }
}

const getRecursiveNodes = async (contract, nodePath) => {
  const nodeObject = await getNodeFromContractAsObject(contract, nodePath)
  if (nodeObject.nodes.length > 0) {
    nodeObject.nodes = await Promise.all(map(nodeObject.nodes, async (path) => await getRecursiveNodes(contract, path)))
  }
  nodeObject.path = nodePath
  return nodeObject
}
