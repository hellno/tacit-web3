import CoinbaseWalletSDK from '@coinbase/wallet-sdk'
import WalletConnect from '@walletconnect/web3-provider'
import { ethers } from 'ethers'
import { isEmpty } from 'lodash'
import Web3Modal from 'web3modal'
import { getDeployedContractForChainId, taskPortalContractAbi } from './constDeployedContracts'
import { toHex } from 'web3-utils'

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
  } catch (error) {
    console.error(error)
  }
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
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none"
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
    web3Modal
  })

  if (web3Modal.cachedProvider) {
    connectWallet(web3Modal, dispatch)
  }
}

export const getDefaultTransactionGasOptions = () => {
  const gasPrice = ethers.utils.parseUnits('5', 'gwei')
  const gasLimit = 1000000
  return {
    gasPrice,
    gasLimit
  }
}

export const getBiconomyTransactionGasOptions = async (biconomy, account, contractAddress, data) => {
  const provider = biconomy.getEthersProvider()

  const gasLimit = await provider.estimateGas({
    to: contractAddress,
    from: account,
    data
  })
  console.log('Gas limit : ', gasLimit)
  return { gasLimit }
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
