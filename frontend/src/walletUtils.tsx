import { ethers } from 'ethers'
import { defaults, map, pick, values, zipObject } from 'lodash'
import {
  erc20ContractAbi,
  getDeployedContractForChainId,
  isNativeChainCurrency,
  taskPortalContractAbi
} from './constDeployedContracts'
import { toHex } from 'web3-utils'
import { getRpcProviderUrlForChainId } from './apiUtils'
import { formatEther } from 'ethers/lib/utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEnsName } from 'wagmi'
//
//
// export const connectWallet = async (web3Modal, dispatch) => {
//   try {
//     const provider = await web3Modal.connect()
//     const library = new ethers.providers.Web3Provider(provider)
//     const accounts = await library.listAccounts()
//
//     let network = null
//     try {
//       network = await library.getNetwork()
//     } catch (e) {
//       console.log('failed to get network', e)
//     }
//     let account = null
//     if (!isEmpty(accounts)) {
//       account = accounts[0]
//     }
//     dispatch({
//       type: 'SET_STATE',
//       state: {
//         provider,
//         library,
//         account,
//         network
//       }
//     })
//
//     analyticsIdentify(account)
//
//     const ensName = await lookupEnsName(account)
//     if (ensName) {
//       dispatch({
//         type: 'SET_ENS_NAME',
//         state: {
//           ensName
//         }
//       })
//     }
//   } catch (error) {
//     console.error(error)
//   }
// }

export const renderWalletConnectComponent = () => {
  return <ConnectButton label="Connect Your Wallet" chainStatus="icon" showBalance={false} />
}

export const getDefaultTransactionGasOptions = () => {
  // const gasPrice = ethers.utils.parseUnits('5', 'gwei')
  const gasLimit = 1000000
  return {
    // gasPrice,
    gasLimit
  }
}

export const getBaseBiconomyGaslessTransactionParams = () => ({
  gasLimit: 2000000,
  signatureType: 'EIP712_SIGN'
})

export const getTaskPortalContractInstanceViaActiveWallet = (signer, chainId) => {
  const { contractAddress } = getDeployedContractForChainId(chainId)
  return new ethers.Contract(contractAddress, taskPortalContractAbi, signer)
}

export const switchNetwork = async (provider, chainId) => {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: toHex(chainId) }]
    })
  } catch (switchError) {
    // error code = chain has not been added to wallet provider
    if (switchError.code === 4902) {
      const params = defaults(
        { rpcUrls: [getRpcProviderUrlForChainId(chainId)] },
        pick(
          getDeployedContractForChainId(chainId),
          ['chainId', 'name', 'nativeCurrency']
        ))
      // @ts-ignore
      params.chainId = toHex(chainId)
      // @ts-ignore
      params.chainName = params.name
      delete params.name
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [params]
        })
      } catch (addError) {
        console.log(addError)
        throw addError
      }
    } else {
      throw switchError
    }
  }
}

export const getERC20ContractForTokenAddress = (tokenAddress, signer) => {
  return new ethers.Contract(tokenAddress, erc20ContractAbi, signer)
}

const getTokenBalance = async (provider, account, tokenAddress) => {
  let balance
  if (isNativeChainCurrency(tokenAddress)) {
    balance = await provider.getBalance(account)
  } else {
    const signer = new ethers.VoidSigner(account, provider)
    const erc20Contract = getERC20ContractForTokenAddress(tokenAddress, signer)
    balance = await erc20Contract.balanceOf(account)
  }
  return formatEther(balance)
}

export const getTokenAddressToMaxAmounts = async (nameToTokenAddress, provider, account) => {
  const tokenAddresses = values(nameToTokenAddress)
  const maxAmounts = await Promise.all(map(tokenAddresses, async (tokenAddress) => await getTokenBalance(provider, account, tokenAddress)))
  return zipObject(tokenAddresses, maxAmounts)
}

export function useMainnetEnsName (address) {
  const { data: ensName } = useEnsName({
    address,
    chainId: 1
  })

  return ensName
}

export type ExternalProvider = {
  isMetaMask?: boolean;
  isStatus?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
  send?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
  request?: (request: { method: string, params?: Array<any> }) => Promise<any>
}
