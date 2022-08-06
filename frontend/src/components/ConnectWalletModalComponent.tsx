import { useConnect } from 'wagmi'
import ModalComponent from './ModalComponent'

export default function ConnectWalletModalComponent ({
  onClose
}) {
  const {
    connect,
    connectors,
    error,
    isLoading,
    pendingConnector
  } =
    useConnect()

  const renderConnectWalletContent = () => {
    <div>
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  }

  return <ModalComponent
    renderContent={renderConnectWalletContent}
    titleText="Edit your task"
    onClose={onClose}
  />
}
