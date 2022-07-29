import CoinbaseWalletSDK from '@coinbase/wallet-sdk'
import WalletConnect from '@walletconnect/web3-provider'
import { ethers } from 'ethers'
import { isEmpty, map, values, zipObject } from 'lodash'
import Web3Modal from 'web3modal'
import {
  erc20ContractAbi,
  getDeployedContractForChainId,
  isNativeChainCurrency,
  taskPortalContractAbi
} from './constDeployedContracts'
import { toHex } from 'web3-utils'
import { getReadOnlyProviderForChainId } from './apiUtils'
import { analyticsIdentify } from './analyticsUtils'
import { formatEther } from 'ethers/lib/utils'

export const providerOptions = {
  coinbasewallet: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: 'Tacit', // Required
      infuraId: process.env.INFURA_KEY, // Required
      // rpc: '', // Optional if `infuraId` is provided; otherwise it's required
      // chainId: 1, // Optional. It defaults to 1 if not provided
      darkMode: true // Optional. Use dark theme, defaults to false
    }
  },
  walletconnect: {
    package: WalletConnect,
    options: {
      infuraId: process.env.INFURA_KEY
    }
  }
}

export const connectWallet = async (web3Modal, dispatch) => {
  try {
    const provider = await web3Modal.connect()
    const library = new ethers.providers.Web3Provider(provider)
    const accounts = await library.listAccounts()

    let network = null
    try {
      network = await library.getNetwork()
    } catch (e) {
      console.log('failed to get network', e)
    }
    let account = null
    if (!isEmpty(accounts)) {
      account = accounts[0]
    }
    dispatch({
      type: 'SET_STATE',
      state: {
        provider,
        library,
        account,
        network
      }
    })

    analyticsIdentify(account)

    const ensName = await lookupEnsName(account)
    if (ensName) {
      dispatch({
        type: 'SET_ENS_NAME',
        state: {
          ensName
        }
      })
    }
  } catch (error) {
    console.error(error)
  }
}

export const lookupEnsName = async (account) => {
  const provider = getReadOnlyProviderForChainId(1)
  return await provider.lookupAddress(account)
}

export const handleChainInteractionError = (error) => {
  switch (error.code) {
    case -32602:
      // User Rejected OR Error processing the transaction
      break
    case -32003:
      // out of gas
      break
    default:
      break
  }
}

export const renderWalletConnectComponent = ({
  web3Modal,
  dispatch,
  onSubmitFunc
}) => {
  const onButtonSubmit = () => {
    if (onSubmitFunc) {
      onSubmitFunc()
    }

    connectWallet(web3Modal, dispatch)
  }

  return <div className="">
    <button
      onClick={onButtonSubmit}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none"
    >
      Connect Your Wallet
    </button>
  </div>
}

export const loadWeb3Modal = (dispatch) => {
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
    theme: 'dark'
  })

  dispatch({
    type: 'SET_WEB3_MODAL',
    state: {
      web3Modal
    }
  })

  if (web3Modal.cachedProvider) {
    connectWallet(web3Modal, dispatch)
  }
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
  gasLimit: 8000000,
  signatureType: 'EIP712_SIGN'
  // signatureType: 'PERSONAL_SIGN'
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
    // error code = chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            getDeployedContractForChainId(chainId)
          ]
        })
      } catch (addError) {
        console.log(addError)
        throw addError
      }
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
