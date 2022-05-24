import { filter, includes, map } from 'lodash'
import abi from './abi/TaskPortal.json'
import { ethers } from 'ethers'

export const DEPLOYED_CONTRACTS = [{
  chainId: 5,
  name: 'Görli Testnet',
  contractAddress: '0xcafda016ed4c37464318e3f73d66fe9c92d1f2d4'
}, {
  chainId: 1337,
  name: 'Local Hardhat Testnet',
  // must update this based on local re-deployments
  contractAddress: '0x5fbdb2315678afecb367f032d93f642f64180aa3'
}, {
  chainId: 1338,
  name: 'Local Foundry Testnet',
  // must update this based on local re-deployments
  contractAddress: '0x5fbdb2315678afecb367f032d93f642f64180aa3'
}]

export function isSupportedNetwork (chainId) {
  return includes(map(DEPLOYED_CONTRACTS, 'chainId'), chainId)
}

export function getDeployedContractForChainId (chainId) {
  const contracts = filter(DEPLOYED_CONTRACTS, ['chainId', chainId])
  return contracts && contracts[0]
}

export const ETH_AS_TOKEN_ADDRESS_FOR_CONTRACT = '0x0000000000000000000000000000000000000000'

export const tokenAddressToDecimals = {
  ETH_AS_TOKEN_ADDRESS_FOR_CONTRACT: 18
}

export const isEthBounty = (tokenAddress) => tokenAddress === ETH_AS_TOKEN_ADDRESS_FOR_CONTRACT
export const contractABI = abi.abi

export const getTaskFromContractAsObject = async (contract, taskPath) => {
  let [ownerAddress, taskData, taskIsOpen, bountyTokenAddress, bountyAmount] = await contract.getTask(taskPath)
  if (isEthBounty(bountyTokenAddress)) {
    bountyAmount = ethers.utils.formatUnits(bountyAmount)
  }
  return {
    ownerAddress,
    taskData,
    taskIsOpen,
    bountyTokenAddress,
    bountyAmount
  }
}
