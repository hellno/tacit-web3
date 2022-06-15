import { getNameToTokenAddressForChainId } from './constDeployedContracts'
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

export const getBountyCurrency = (bounty, chainId) => {
  return get(invert(getNameToTokenAddressForChainId(chainId)), bounty.tokenAddress)
}

export const getBountyAmount = (bounty) => {
  return Math.round((parseFloat(bounty.amount) + Number.EPSILON) * 100) / 100
}

export const getBountyAmountWithCurrencyStringFromTaskObject = (bounty, chainId) => {
  const tokenCurrency = getBountyCurrency(bounty, chainId)
  const userTokenAmount = getBountyAmount(bounty)

  return `${userTokenAmount} ${tokenCurrency}`
}
