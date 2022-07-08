const useAnalytics = process.env.NODE_ENV === 'production' && typeof window !== 'undefined'

export const analyticsIdentify = (id) => {
  if (useAnalytics) {
    return
  }
  window.heap.identify(id)
}

export const analyticsAddUserProperties = (properties) => {
  if (useAnalytics) {
    return
  }
  window.heap.addUserProperties(properties)
}

export const analyticsTrackEvent = (eventName, properties) => {
  if (useAnalytics) {
    return
  }
  window.heap.track(eventName, properties)
}
