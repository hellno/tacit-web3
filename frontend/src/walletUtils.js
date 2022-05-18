import abi from './abi/TaskPortal.json'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'
import WalletConnect from '@walletconnect/web3-provider'
import { ethers } from 'ethers'
import { isEmpty, truncate } from 'lodash'

/**
 * @param {number} chainId
 */
export const getUserFriendlyNameForChainId = (chainId) => {
  switch (chainId) {
    case 1:
      return 'Ethereum'
    case 5:
      return 'Görli Testnet'
    default:
      return ''
  }
}

export const contractABI = abi.abi
export const contractAddress = '0xAb3160358410B2912f319C2Ec61a6d88bF138520'

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
    const network = await library.getNetwork()

    dispatch({
      type: 'SET_STATE',
      state: {
        provider,
        library,
        network,
        account: accounts[0]
      }
    })
  } catch (error) {
    switch (error.code) {
      case -32602:
        // setTaskSubmissionState(TaskSubmissionState.UserRejected)
        break
      default:
        break
    }
    console.error(error)
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
