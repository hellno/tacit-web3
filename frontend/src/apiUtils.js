import { ethers } from 'ethers'
import { getSiteUrl } from './utils'

export const getRpcProviderUrlForChainId = (chainId) => {
  switch (chainId) {
    case 1:
      return 'https://rpc.ankr.com/eth'
    case 100:
      return 'https://rpc.ankr.com/gnosis'
    case 137:
      return 'https://rpc.ankr.com/polygon'
    case 1337:
    case 1338:
      return 'http://127.0.0.1:8545/'
    default:
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

export const refreshVercelPage = async (pathToPage) => {
  const apiEndpoint = getSiteUrl()
  const apiUrl = `${apiEndpoint}/api/revalidate/${pathToPage}?secret=${process.env.TACIT_SERVER_TOKEN}`
  return await fetch(apiUrl)
}
