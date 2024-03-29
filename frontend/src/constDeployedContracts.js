import { find, includes, map, union } from 'lodash'
import taskPortalAbi from './abi/TaskPortal.json'
import erc20Abi from './abi/IERC20.json'
import { ethers } from 'ethers'

export const taskPortalContractAbi = taskPortalAbi.abi
export const erc20ContractAbi = erc20Abi.abi

const _contracts = [{
  chainId: 5,
  name: 'Görli Testnet',
  shortName: 'gor', // if changed, must update biconomy as well
  contractAddress: '0x8ae3baa9452b2483c2c1bd43b2d89ee554c123e5',
  blockExplorer: 'https://goerli.etherscan.io',
  nativeCurrency: {
    name: 'Görli Ether',
    symbol: 'GOR',
    decimals: 18
  }
}, {
  chainId: 100,
  name: 'Gnosis Chain',
  shortName: 'gno',
  contractAddress: '0x77c508997cb35f566be4803865d22976374f63eb',
  blockExplorer: 'https://blockscout.com/xdai/mainnet',
  nativeCurrency: {
    name: 'xDAI',
    symbol: 'xDAI',
    decimals: 18
  }
}, {
  chainId: 137,
  name: 'Polygon Mainnet',
  shortName: 'matic',
  contractAddress: '0xab3160358410b2912f319c2ec61a6d88bf138520',
  blockExplorer: 'https://polygonscan.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  }
}, {
  chainId: 80001,
  name: 'Polygon Testnet Mumbai',
  contractAddress: '0xAb3160358410B2912f319C2Ec61a6d88bF138520',
  shortName: 'maticmum',
  blockExplorer: 'https://mumbai.polygonscan.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  }
}]

export const chainIdToBiconomyApiKey = {
  5: process.env.BICONOMY_GOERLI_API_KEY,
  100: process.env.BICONOMY_GNOSIS_API_KEY,
  137: process.env.BICONOMY_POLYGON_API_KEY
}

export const getDeployedContracts = () => {
  let contracts = _contracts

  if (process.env.NODE_ENV === 'development') {
    contracts = union(contracts, [{
      chainId: 1337,
      name: 'Local Hardhat Testnet',
      contractAddress: '0x5fbdb2315678afecb367f032d93f642f64180aa3', // must update this based on local re-deployments
      blockExplorer: 'https://my-block-explorer.io/'
    }, {
      chainId: 1339,
      name: 'Local Foundry Testnet',
      contractAddress: '0x5fbdb2315678afecb367f032d93f642f64180aa3', // must update this based on local re-deployments
      blockExplorer: 'https://my-block-explorer.io/'
    }])
  }
  return contracts
}

export const isSupportedNetwork = chainId => includes(map(getDeployedContracts(), 'chainId'), chainId)

export const getDeployedContractForChainId = chainId => find(getDeployedContracts(), (chain) => chain.chainId === chainId)

export const getChainIdFromShortName = (shortName) => find(getDeployedContracts(), (chain) => chain.shortName === shortName).chainId

export const NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT = '0x0000000000000000000000000000000000000000'

// export const tokenAddressToDecimals = {
//   ETH_AS_TOKEN_ADDRESS_FOR_CONTRACT: 18,
//   '0x73967c6a0904aA032C103b4104747E88c566B1A2': 18,
//   '0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc': 18
// }

export const isNativeChainCurrency = (tokenAddress) => tokenAddress === NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT

export const getNameToTokenAddressObjectForChainId = (chainId) => {
  // WATCH OUT ->> these addresses are case-sensitive
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
        WETH: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
        LINK: '0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2'
      }
    case 137:
      return {
        MATIC: NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT,
        USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        FRAX: '0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89',
        BAT: '0x3Cef98bb43d732E2F285eE605a8158cDE967D219',
        WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6'
      }
    case 80001:
      return {
        MATIC: NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT,
        'DUMMY ERC20': '0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1',
        'MINTABLE USDC': '0x8f7116CA03AEB48547d0E2EdD3Faa73bfB232538'
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

  return {
    ownerAddress,
    taskData,
    taskIsOpen,
    nodes,
    bounties
  }
}
