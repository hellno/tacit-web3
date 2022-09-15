import { ethers } from 'ethers'
import {
  getChainIdFromShortName,
  getDeployedContractForChainId,
  getNodeFromContractAsObject,
  getTaskFromContractAsObject,
  taskPortalContractAbi
} from '../../../src/constDeployedContracts'
import { getObjectInIPFS } from '../../../src/storageUtils'
import { map, merge, split } from 'lodash'
import { getIpfsPathFromOnChainTaskData, getReadOnlyProviderForChainId } from '../../../src/apiUtils'
import { withSentry } from '@sentry/nextjs'

async function handler (req, res) {
  const { slug } = req.query

  console.log('slug is', slug)
  const [chainShortName, taskId] = split(slug, ':')
  const chainId = getChainIdFromShortName(chainShortName)
  const provider = getReadOnlyProviderForChainId(chainId)

  try {
    const { contractAddress } = getDeployedContractForChainId(chainId)
    const taskPortalContract = new ethers.Contract(contractAddress, taskPortalContractAbi, provider)

    const taskNodeData = await getTaskFromContractAsObject(taskPortalContract, taskId)
    const ipfsPath = getIpfsPathFromOnChainTaskData(taskNodeData.taskData)
    const [cid, fname] = ipfsPath.split('/')

    const taskObject = await getObjectInIPFS(cid, fname)
    const nestedNodesObject = await getRecursiveNodes(taskPortalContract, taskId)
    const returnPayload = merge(
      taskObject,
      taskNodeData,
      nestedNodesObject,
      { chainId }
    )
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

export default withSentry(handler)
