import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { Chain, chain, configureChains, createClient } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'

export const gnosisChain: Chain = {
  id: 100,
  name: 'Gnosis Chain',
  blockExplorers: {
    default: {
      url: 'https://blockscout.com/xdai/mainnet',
      name: 'BlockScout'
    }
  },
  nativeCurrency: {
    name: 'xDAI',
    symbol: 'xDAI',
    decimals: 18
  },
  rpcUrls: {
    default: 'https://rpc.ankr.com/gnosis'
  },
  // @ts-ignore
  iconUrl: 'https://ipfs.io/ipfs/bafybeidk4swpgdyqmpz6shd5onvpaujvwiwthrhypufnwr6xh3dausz2dm'
}

export const {
  chains,
  provider
} = configureChains(
  [chain.polygon, // gnosisChain,
    chain.goerli, chain.polygonMumbai, chain.mainnet],
  [
    // infuraProvider({ apiKey: process.env.INFURA_KEY })
    alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY })
    // publicProvider()
  ]
)
const { connectors } = getDefaultWallets({
  appName: 'Tacit',
  chains
})

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})
