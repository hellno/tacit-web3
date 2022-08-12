import { withSentry } from '@sentry/nextjs'
import { ethers } from 'ethers'
import {
  getChainIdFromShortName,
  getDeployedContractForChainId,
  getNodeFromContractAsObject,
  getTaskFromContractAsObject,
  taskPortalContractAbi
} from '../../../src/constDeployedContracts'
import { getObjectInIPFS } from '../../../src/storageUtils'
import { split } from 'lodash'
import { getIpfsPathFromOnChainTaskData, getReadOnlyProviderForChainId } from '../../../src/apiUtils'

async function handler (req, res) {
  const { slug } = req.query

  console.log('slug is', slug)
  const [chainShortName, shareId] = split(slug, ':')
  const chainId = getChainIdFromShortName(chainShortName)
  const provider = getReadOnlyProviderForChainId(chainId)

  try {
    const { contractAddress } = getDeployedContractForChainId(chainId)
    const taskPortalContract = new ethers.Contract(contractAddress, taskPortalContractAbi, provider)
    const nodesResult = await getNodeFromContractAsObject(taskPortalContract, shareId)

    const { taskPath } = nodesResult
    const taskNodeData = await getTaskFromContractAsObject(taskPortalContract, taskPath)
    const ipfsPath = getIpfsPathFromOnChainTaskData(taskNodeData.taskData)
    const [cid, fname] = ipfsPath.split('/')
    const taskObject = await getObjectInIPFS(cid, fname)
    const returnPayload = {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...taskObject,
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...taskNodeData,
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...{
        path: shareId,
        chainId
      }
    }
    console.log(returnPayload)
    res.status(200).json(returnPayload)
  } catch (err) {
    console.log('err when getting share data for id', shareId, err)
    res.status(500).json({ error: 'failed to load data' })
  }
}

export default withSentry(handler)
