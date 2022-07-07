import { find, includes, map, startCase, union } from 'lodash'
import taskPortalAbi from './abi/TaskPortal.json'
import erc20Abi from './abi/IERC20.json'
import { ethers } from 'ethers'

export const taskPortalContractAbi = taskPortalAbi.abi
export const erc20ContractAbi = erc20Abi.abi

const _contracts = [{
  chainId: 5,
  name: 'Görli Testnet',
  shortName: 'gor',
  // if changed, must update biconomy as well
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
},
// {
//   chainId: 137,
//   name: 'Polygon Mainnet',
//   shortName: 'MATIC',
//   contractAddress: '',
//   blockExplorer: 'https://polygonscan.com',
//   nativeCurrency: {
//     name: 'MATIC',
//     symbol: 'MATIC',
//     decimals: 18
//   }
// },
{
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
}
]

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
        WETH: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
        LINK: '0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2'
      }
    case 137:
      return {
        USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        WETH: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        FRAX: '0x45c32fa6df82ead1e2ef74d17b76547eddfaff89',
        BAT: '0x3cef98bb43d732e2f285ee605a8158cde967d219',
        WBTC: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6'
      }
    case 80001:
      return {
        MATIC: NATIVE_CHAIN_CURRENCY_AS_TOKEN_ADDRESS_FOR_CONTRACT,
        DUMMY_ERC20: '0xfe4f5145f6e09952a5ba9e956ed0c25e3fa4c7f1'
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

export const getUserFriendlyNameForNetwork = (network) => {
  const contract = getDeployedContractForChainId(network.chainId)
  const name = (contract && contract.name) || network.name
  return startCase(name)
}
