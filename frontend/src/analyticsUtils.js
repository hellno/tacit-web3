import { isDevEnv, isProdEnv } from './utils'

const useAnalytics = isProdEnv() && typeof window !== 'undefined'

export const analyticsIdentify = (id) => {
  if (useAnalytics) {
    window.heap.identify(id)
  } else if (isDevEnv()) {
    console.log('analytics identify with id:', id)
  }
}

export const analyticsAddUserProperties = (properties) => {
  if (useAnalytics) {
    window.heap.addUserProperties(properties)
  } else if (isDevEnv()) {
    console.log('analytics add properties:', properties)
  }
}

export const analyticsTrackEvent = (eventName, properties) => {
  if (useAnalytics) {
    window.heap.track(eventName, properties)
  } else if (isDevEnv()) {
    console.log('analytics track event', eventName, properties)
  }
}
