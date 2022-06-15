import { filter, includes, map, union } from 'lodash'
import taskPortalAbi from './abi/TaskPortal.json'
import erc20Abi from './abi/IERC20.json'
import { ethers } from 'ethers'

export const taskPortalContractAbi = taskPortalAbi.abi
export const erc20ContractAbi = erc20Abi.abi

const _contracts = [{
  chainId: 5,
  name: 'Görli Testnet',
  contractAddress: '0x652ef3c2bb7b790226530666b7efd9c4b6df54ea'
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

export const NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT = '0x0000000000000000000000000000000000000000'

// export const tokenAddressToDecimals = {
//   ETH_AS_TOKEN_ADDRESS_FOR_CONTRACT: 18,
//   '0x73967c6a0904aA032C103b4104747E88c566B1A2': 18,
//   '0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc': 18
// }

export const isNativeChainCurrency = (tokenAddress) =>
  tokenAddress === NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT

export const getNameToTokenAddressForChainId = (chainId) => {
  switch (chainId) {
    case 5:
    case 1337:
    case 1338:
      return {
        ETH: NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT,
        DAI: '0x73967c6a0904aA032C103b4104747E88c566B1A2',
        'Faucet Token': '0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc'
      }
    case 100:
      return {
        xDai: NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT,
        GNO: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
        USDC: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
        DAI: '0x44fA8E6f47987339850636F88629646662444217'
      }
  }
}

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
  const [ownerAddress, taskData, taskIsOpen, nodes] = await contract.getTask(taskPath)
  let bounties = await contract.getBountiesForTask(taskPath)
  bounties = map(bounties, (bounty) => ({
    tokenAddress: bounty[0],
    amount: ethers.utils.formatUnits(bounty[1])
  }))

  // if (isEthBounty(bountyTokenAddress)) {
  //   bountyAmount = ethers.utils.formatUnits(bountyAmount)
  // }
  return {
    ownerAddress,
    taskData,
    taskIsOpen,
    nodes,
    bounties
  }
}
