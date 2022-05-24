import CoinbaseWalletSDK from '@coinbase/wallet-sdk'
import WalletConnect from '@walletconnect/web3-provider'
import { ethers } from 'ethers'
import { isEmpty, truncate } from 'lodash'
import Web3Modal from 'web3modal'

/**
 * @param {number} chainId
 */
export const getUserFriendlyNameForChainId = (chainId) => {
  switch (chainId) {
    case 1:
      return 'Ethereum'
    case 5:
      return 'Görli Testnet'
    case 1338:
      return 'Foundry Local Testnet'
    default:
      return ''
  }
}

export const providerOptions = {
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: 'Web 3 Modal Demo',
      infuraId: process.env.INFURA_KEY
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

export const renderWalletConnectComponent = (account, web3Modal, dispatch) => {
  const isWalletConnected = !isEmpty(account)

  return <div className="">
    {isWalletConnected
      ? <span
        className="inline-flex items-center px-4 py-2 shadow-sm shadow-gray-600 text-sm font-medium rounded-sm text-white bg-yellow-400">
                    Wallet {truncate(account, { length: 14 })}
                  </span>
      : <button
        onClick={() => connectWallet(web3Modal, dispatch)}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none"
      >
        Connect Wallet
      </button>}
  </div>
}

export const loadWeb3Modal = (dispatch) => {
  const web3Modal = new Web3Modal({
    network: 'localhost', // optional
    cacheProvider: true, // optional
    providerOptions // required
  })

  dispatch({
    type: 'SET_WEB3_MODAL',
    web3Modal
  })

  if (web3Modal.cachedProvider) {
    connectWallet(web3Modal, dispatch)
  }
}
