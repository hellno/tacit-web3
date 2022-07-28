/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    WEB3STORAGE_TOKEN: process.env.WEB3STORAGE_TOKEN,
    SITE: process.env.SITE || process.env.VERCEL_URL,
    USE_LOCAL_NODE: process.env.USE_LOCAL_NODE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    HEAP_ANALYTICS_ID: process.env.HEAP_ANALYTICS_ID,
    BICONOMY_GOERLI_API_KEY: process.env.BICONOMY_GOERLI_API_KEY,
    BICONOMY_GNOSIS_API_KEY: process.env.BICONOMY_GNOSIS_API_KEY,
    INFURA_RPC_ENDPOINT: process.env.INFURA_RPC_ENDPOINT,
    INFURA_KEY: process.env.INFURA_KEY,
    TACIT_SERVER_TOKEN: process.env.TACIT_SERVER_TOKEN
  },
  images: {
    domains: ['images.unsplash.com']
  }
}
