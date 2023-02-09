import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getDeployedContractForChainId } from '../constDeployedContracts'
import { classNames } from '../utils'

export default function WalletConnectButtonForForm ({
  requiredChainId = undefined
}) {
  const renderButton = (text, onClick, canHover = true) => {
    return <button
      onClick={onClick} type="button"
      className={classNames(canHover && 'hover:bg-primary-light focus:outline-none',
        'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary'
      )}
    >
      {text}
    </button>
  }

  return <ConnectButton.Custom>
    {({
      account,
      chain,
      openAccountModal,
      openChainModal,
      openConnectModal,
      mounted
    }) => {
      return (
        <div
          {...(!mounted && {
            'aria-hidden': true,
            style: {
              opacity: 0,
              pointerEvents: 'none',
              userSelect: 'none'
            }
          })}
        >
          {(() => {
            if (!mounted || !account || !chain) {
              return renderButton('Connect Wallet', openConnectModal)
            }

            const isWrongChain = requiredChainId && requiredChainId !== chain.id
            if (chain.unsupported) {
              return renderButton('Switch network', openChainModal)
            }
            if (isWrongChain) {
              const contract = getDeployedContractForChainId(requiredChainId)
              return renderButton(`Switch network to ${contract.name}`, openChainModal)
            }

            return renderButton(account.ensName || account.address, openAccountModal, false)
          })()}
        </div>
      )
    }}
  </ConnectButton.Custom>
}
