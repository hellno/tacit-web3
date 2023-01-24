import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { Chain, configureChains, createClient, goerli, mainnet } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { polygon, polygonMumbai } from 'wagmi/chains'

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
  rpcUrls: { default: { http: ['https://rpc.ankr.com/gnosis'] } },
  // @ts-ignore
  iconUrl: 'https://ipfs.io/ipfs/bafybeidk4swpgdyqmpz6shd5onvpaujvwiwthrhypufnwr6xh3dausz2dm'
}

export const {
  chains: [, ...chains], // Omit first chain (mainnet), get the rest
  provider
} = configureChains(
  [mainnet, polygon, gnosisChain, goerli, polygonMumbai],
  [
    // infuraProvider({ apiKey: process.env.INFURA_KEY })
    alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }),
    publicProvider(),
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== gnosisChain.id) return null
        return { http: chain.rpcUrls.default.http[0] }
      }
    })
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
