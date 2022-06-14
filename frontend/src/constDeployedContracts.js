import { filter, includes, map, union } from 'lodash'
import taskPortalAbi from './abi/TaskPortal.json'
import erc20Abi from './abi/IERC20.json'
import { ethers } from 'ethers'

export const taskPortalContractAbi = taskPortalAbi.abi
export const erc20ContractAbi = erc20Abi.abi

const _contracts = [{
  chainId: 5,
  name: 'Görli Testnet',
  contractAddress: '0x020fb7f1d6735340e09e707f8da1bcb1e6d6769a'
  // contractAddress: '0x9e6da52d8400329cea94d4be0840f713ace712c2'
}]

export const getDeployedContracts = () => {
  let contracts = _contracts

  if (process.env.NODE_ENV === 'development') {
    contracts = union(contracts, [{
      chainId: 1337,
      name: 'Local Hardhat Testnet', // must update this based on local re-deployments
      contractAddress: '0x5fbdb2315678afecb367f032d93f642f64180aa3'
    }, {
      chainId: 1339,
      name: 'Local Foundry Testnet', // must update this based on local re-deployments
      contractAddress: '0x5fbdb2315678afecb367f032d93f642f64180aa3'
    }])
  }
  return contracts
}

export function isSupportedNetwork (chainId) {
  return includes(map(getDeployedContracts(), 'chainId'), chainId)
}

export function getDeployedContractForChainId (chainId) {
  const contracts = filter(getDeployedContracts(), ['chainId', chainId])
  return contracts && contracts[0]
}

export const ETH_AS_TOKEN_ADDRESS_FOR_CONTRACT = '0x0000000000000000000000000000000000000000'

export const nameToTokenAddress = {
  ETH: ETH_AS_TOKEN_ADDRESS_FOR_CONTRACT,
  DAI: '0x73967c6a0904aA032C103b4104747E88c566B1A2',
  'Faucet Token': '0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc'
}

export const tokenAddressToDecimals = {
  ETH_AS_TOKEN_ADDRESS_FOR_CONTRACT: 18,
  '0x73967c6a0904aA032C103b4104747E88c566B1A2': 18,
  '0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc': 18
}

export const isEthBounty = (tokenAddress) => tokenAddress === ETH_AS_TOKEN_ADDRESS_FOR_CONTRACT

export const getNodeFromContractAsObject = async (contract, nodePath) => {
  const [parent, owner, nodeType, data, nodes, isOpen, taskPath] = await contract.getNode(nodePath)
  return {
    parent,
    owner,
    nodeType,
    data,
    nodes,
    isOpen,
    taskPath
  }
}

export const getTaskFromContractAsObject = async (contract, taskPath) => {
  let [ownerAddress, taskData, taskIsOpen, nodes, bountyTokenAddress, bountyAmount] = await contract.getTask(taskPath)
  if (isEthBounty(bountyTokenAddress)) {
    bountyAmount = ethers.utils.formatUnits(bountyAmount)
  }
  return {
    ownerAddress,
    taskData,
    taskIsOpen,
    nodes,
    bountyTokenAddress,
    bountyAmount
  }
}
