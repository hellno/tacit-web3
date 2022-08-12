import { ethers } from 'ethers'
import { get } from 'lodash'

export const chainIdToRpcUrl = {
  1: 'https://rpc.ankr.com/eth',
  5: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  100: 'https://rpc.ankr.com/gnosis',
  137: 'https://rpc.ankr.com/polygon',
  1337: 'http://127.0.0.1:8545/',
  1338: 'http://127.0.0.1:8545/',
  80001: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
}
export const getRpcProviderUrlForChainId = (chainId) => {
  const rpcUrl = get(chainIdToRpcUrl, chainId)

  if (rpcUrl) {
    return rpcUrl
  } else {
    throw new Error(`No provider for chainId: ${chainId}`)
  }
}

export const getReadOnlyProviderForChainId = (chainId) => {
  let url

  switch (chainId) {
    case 1:
      return new ethers.providers.AlchemyProvider('homestead', process.env.ALCHEMY_API_KEY)
    case 5:
      return new ethers.providers.AlchemyProvider('goerli', process.env.ALCHEMY_API_KEY)
    case 100:
      url = 'https://rpc.ankr.com/gnosis'
      break
    case 137:
      url = 'https://rpc.ankr.com/polygon'
      break
    // return new ethers.providers.AlchemyProvider('matic', process.env.ALCHEMY_API_KEY)
    case 1337:
    case 1338:
      url = 'http://127.0.0.1:8545/'
      break
    case 80001:
      return new ethers.providers.AlchemyProvider('maticmum', process.env.ALCHEMY_API_KEY)
    default:
      throw new Error(`No provider for chainId: ${chainId}`)
  }
  return new ethers.providers.JsonRpcProvider(url)
}

export const makeIpfsPathForOnChainTask = (ipfsPath) => {
  return ethers.utils.defaultAbiCoder.encode(
    ['bytes'], // encode as bytes array
    [ethers.utils.toUtf8Bytes(ipfsPath)
    ])
}

export const getIpfsPathFromOnChainTaskData = (taskData) => {
  let ipfsPath
  ipfsPath = ethers.utils.toUtf8String(taskData)

  if (ipfsPath.startsWith('\x00')) {
    ipfsPath = ipfsPath.split('\\')[1].split('\x00')[0]
  }
  return ipfsPath
}
