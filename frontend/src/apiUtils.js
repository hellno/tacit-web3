import useSWR from 'swr'
import { isEmpty } from 'lodash'

export const fetcher = (...args) => fetch(...args).then(res => res.json())

export function getSharePageData (shareId, chainId) {
  const {
    data,
    error
  } = useSWR(`/api/getSharePageData/${shareId}/${chainId}`, fetcher)

  return {
    data,
    isLoading: !error && isEmpty(data),
    isError: error
  }
}
