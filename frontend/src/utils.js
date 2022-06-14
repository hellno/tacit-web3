import { isEthBounty, nameToTokenAddress } from './constDeployedContracts'
import { ethers } from 'ethers'
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

export const getBountyCurrency = (taskObject) => isEthBounty(taskObject.bountyTokenAddress) ? 'ETH' : get(invert(nameToTokenAddress), taskObject.bountyTokenAddress)

export const getBountyAmount = (taskObject) => {
  let userTokenAmount

  if (isEthBounty(taskObject.bountyTokenAddress)) {
    userTokenAmount = Math.round((parseFloat(taskObject.bountyAmount) + Number.EPSILON) * 100) / 100
  } else {
    const tokenAmountStr = ethers.utils.formatUnits(taskObject.bountyAmount)
    userTokenAmount = Math.round((parseFloat(tokenAmountStr) + Number.EPSILON) * 100) / 100
  }
  return userTokenAmount
}

export const getBountyAmountWithCurrencyStringFromTaskObject = (taskObject) => {
  const tokenCurrency = getBountyCurrency(taskObject)
  const userTokenAmount = getBountyAmount(taskObject)

  return `${userTokenAmount} ${tokenCurrency}`
}
