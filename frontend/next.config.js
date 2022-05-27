/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    WEB3STORAGE_TOKEN: process.env.WEB3STORAGE_TOKEN,
    SITE: process.env.SITE || process.env.VERCEL_URL,
    USE_LOCAL_NODE: process.env.USE_LOCAL_NODE
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
