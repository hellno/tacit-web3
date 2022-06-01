/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    WEB3STORAGE_TOKEN: process.env.WEB3STORAGE_TOKEN,
    SITE: process.env.SITE || process.env.VERCEL_URL,
    USE_LOCAL_NODE: process.env.USE_LOCAL_NODE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
  images: {
    domains: ['images.unsplash.com']
  },
  exclude:
    [
      'node_modules',
      '**/__tests__',
      '**/*.test.js',
      '**/*.spec.js'
    ]
}
