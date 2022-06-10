import { createClient } from '@supabase/supabase-js'

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
    email
  }

  const { error } = await supabase.from('Web3User').insert([data], {
    returning: 'minimal' // Don't return the value after inserting
  })
  if (error) {
    console.log(error)
    return {
      success: false,
      error: error.message
    }
  }
  return { success: true }
}
