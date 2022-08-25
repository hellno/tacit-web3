import { getDeployedContractForChainId, getNameToTokenAddressObjectForChainId } from './constDeployedContracts'
import { get, invert } from 'lodash'

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function flattenNodesRecursively (obj) {
  return obj.flatMap(item => item.nodes ? [item, ...flattenNodesRecursively(item.nodes)] : item)
}

export const getBountyCurrency = (tokenAddress, chainId) => {
  return get(invert(getNameToTokenAddressObjectForChainId(chainId)), tokenAddress)
}

export const getBountyAmount = (amount) => {
  return Math.round((parseFloat(amount) + Number.EPSILON) * 1000000) / 1000000
}

export const getBountyAmountWithCurrencyStringFromTaskObject = (bounty, chainId) => {
  const tokenCurrency = getBountyCurrency(bounty.tokenAddress, chainId)
  const userTokenAmount = getBountyAmount(bounty.amount)

  return `${userTokenAmount} ${tokenCurrency}`
}

export const getSitePathForNode = ({
  nodeType,
  chainId,
  path
}) => {
  const shortNameForChain = getDeployedContractForChainId(chainId).shortName
  return `${nodeType}/${shortNameForChain}:${path}`
}

export const getSiteUrl = () => process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://web3.tacit.so'

export const isProdEnv = () => process.env.NODE_ENV === 'production'

export const isDevEnv = () => process.env.NODE_ENV === 'development'

export const refreshVercelPage = async (pathToPage) => {
  const apiEndpoint = getSiteUrl()
  const apiUrl = `${apiEndpoint}/api/revalidate/${pathToPage}?secret=${process.env.TACIT_SERVER_TOKEN}`
  return await fetch(apiUrl)
}
