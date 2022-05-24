import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AppContextProvider } from '../src/context'
import BannerComponent from '../src/components/BannerComponent'

function MyApp ({
  Component,
  pageProps
}: AppProps) {
  return <AppContextProvider>
    <BannerComponent
      title={'This is an early alpha release on Testnet - heavy work on UI and Smart Contracts in Progress'} />
    <Component {...pageProps} />
  </AppContextProvider>
}

export default MyApp
