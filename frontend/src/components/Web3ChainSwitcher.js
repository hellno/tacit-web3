import { Fragment, useContext } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { isEmpty, map } from 'lodash'
import { getDeployedContracts, getUserFriendlyNameForNetwork, isSupportedNetwork } from '../constDeployedContracts'
import { classNames } from '../utils'
import { AppContext } from '../context'
import { switchNetwork } from '../walletUtils'

const Web3ChainSwitcher = () => {
  const [state, dispatch] = useContext(AppContext)
  const {
    network,
    provider
  } = state

  if (isEmpty(network)) {
    return <></>
  }

  const { chainId } = network
  const disconnectWallet = () => {
    dispatch({
      type: 'SET_PROVIDER',
      state: {
        provider: null
      }
    })
    dispatch({
      type: 'SET_ACCOUNT',
      state: {
        account: null
      }
    })
  }

  const chains = getDeployedContracts().filter(
    (chain) => chain.chainId !== network.chainId
  )
  const currentChainName = getUserFriendlyNameForNetwork(network)

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className="inline-flex justify-center w-40 rounded-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500">
          Network
          <ChevronDownIcon
            className="-mr-1 ml-2 h-5 w-5"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="origin-top-right absolute right-0 mt-2 w-full rounded-sm shadow-md bg-white divide-y divide-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
                <span className="w-full text-left text-gray-700 block px-4 py-2 text-sm">
                  {currentChainName}{' '}
                  {isSupportedNetwork(chainId) ? '✅' : '(Unsupported)'}
                </span>
            </Menu.Item>
            {map(chains, (chain) => {
              return (
                <Menu.Item key={chain.chainId}>
                  {({ active }) => (
                    <button
                      onClick={() => switchNetwork(provider, chain.chainId).then(() => window.location.reload())}
                      className={classNames(
                        active
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700',
                        'w-full text-left block px-4 py-2 text-sm'
                      )}
                    >
                      {chain.name}
                    </button>
                  )}
                </Menu.Item>
              )
            })}
          </div>
          <div>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => disconnectWallet()}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'w-full text-left block px-4 py-2 text-sm'
                  )}
                >
                  Disconnect
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>)
}

export default Web3ChainSwitcher
