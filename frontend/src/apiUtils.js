import { ethers } from 'ethers'

export const getProviderForChainId = (chainId) => {
  let url

  switch (chainId) {
    case 5:
      return new ethers.providers.AlchemyProvider('goerli', process.env.ALCHEMY_API_KEY)
    case 100:
      url = 'https://rpc.ankr.com/gnosis'
      break
    case 1337:
    case 1338:
      url = 'http://127.0.0.1:8545/'
      break
  }
  return new ethers.providers.JsonRpcProvider(url)
}
