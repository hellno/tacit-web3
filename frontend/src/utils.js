import { isNativeChainCurrency, nameToTokenAddress } from './constDeployedContracts'
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

export const getBountyCurrency = (taskObject) => isNativeChainCurrency(taskObject.bounties[0].tokenAddress) ? 'ETH' : get(invert(nameToTokenAddress), taskObject.bounties[0].tokenAddress)

export const getBountyAmount = (taskObject) => {
  const rawBountyAmount = taskObject.bounties[0].amount
  const userTokenAmount = rawBountyAmount

  // if (isEthBounty(taskObject.bountyTokenAddress)) {
  //   userTokenAmount = Math.round((parseFloat(rawBountyAmount) + Number.EPSILON) * 100) / 100
  // } else {
  //   const tokenAmountStr = ethers.utils.formatUnits(rawBountyAmount)
  //   userTokenAmount = Math.round((parseFloat(tokenAmountStr) + Number.EPSILON) * 100) / 100
  // }
  return userTokenAmount
}

export const getBountyAmountWithCurrencyStringFromTaskObject = (taskObject) => {
  const tokenCurrency = getBountyCurrency(taskObject)
  const userTokenAmount = getBountyAmount(taskObject)

  return `${userTokenAmount} ${tokenCurrency}`
}
