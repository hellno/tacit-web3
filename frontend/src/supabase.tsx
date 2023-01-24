import { createClient } from '@supabase/supabase-js'
import { isEmpty, keyBy, mapValues, uniq } from 'lodash'

export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return createClient(supabaseUrl, supabaseAnonKey)
}

export const addUserToDatabase = async ({
  walletAddress,
  email
}) => {
  if (process.env.NODE_ENV === 'development') {
    return { success: true }
  }

  const supabase = getSupabaseClient()
  const data = {
    wallet_address: walletAddress,
    email: address
  }

  const { error } = await supabase.from('Web3User').insert([data])
  if (error) {
    console.log(error)
    return {
      success: false,
      error: error.message
    }
  }
  return { success: true }
}

// type SupabaseWeb3User = {
//   id: number
//   created_at: string
//   wallet_address: string
//   email: string
// }

export const getUserInfoFromDatabase = async (walletAddresses: string[]) => {
  if (isEmpty(walletAddresses)) {
    return {
      success: false,
      data: []
    }
  }
  const supabase = getSupabaseClient()

  const {
    data,
    error
  } = await supabase
    .from('Web3User')
    .select('wallet_address, email')
    .in('wallet_address', walletAddresses)

  if (error) {
    console.log(error)
    return {
      success: false,
      error: error.message
    }
  }

  return {
    success: true,
    data: mapValues(keyBy(uniq(data), 'wallet_address'), 'email')
  }
}
