import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AppContextProvider } from '../src/context'
import BannerComponent from '../src/components/BannerComponent'

function MyApp ({
  Component,
  pageProps
}: AppProps) {
  const renderAnalyticsScripts = () => {
    return (
      <>
        <script async src={'https://scripts.simpleanalyticscdn.com/latest.js'} />
        <script async dangerouslySetInnerHTML={{
          __html: `
    window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=t.forceSSL||"https:"===document.location.protocol,a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=(r?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n);for(var o=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","removeEventProperty","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=o(p[c])};
      heap.load("${process.env.HEAP_ANALYTICS_ID}");
   `
        }} />
        <script async dangerouslySetInnerHTML={{
          __html: `(function(s,q,e,a,u,k,y){
                    s._sqSettings={site_id:'f9bd9a89-e360-434d-b507-dcc99ecd0c0f'};
                    u=q.getElementsByTagName('head')[0];
                    k=q.createElement('script');
                    k.src=e+s._sqSettings.site_id;
                    u.appendChild(k);
                  })(window,document,'https://cdn.squeaky.ai/g/0.4.0/script.js?');
        `
        }} />
      </>
    )
  }
  const isProd = process.env.NODE_ENV === 'production'

  return <AppContextProvider>
    <BannerComponent
      title={'This is an alpha release → you are early '} />
    <Component {...pageProps} />
    {isProd && renderAnalyticsScripts()}
  </AppContextProvider>
}

export default MyApp
