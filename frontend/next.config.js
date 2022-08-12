const { withSentryConfig } = require('@sentry/nextjs')

const moduleExports = {
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
    BICONOMY_POLYGON_API_KEY: process.env.BICONOMY_POLYGON_API_KEY,
    INFURA_KEY: process.env.INFURA_KEY,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    TACIT_SERVER_TOKEN: process.env.TACIT_SERVER_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN
  },
  images: {
    domains: ['images.unsplash.com']
  }
}

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions)
