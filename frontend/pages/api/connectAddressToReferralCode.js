import { getSupabaseClient } from '../../src/supabase'
import { isEmpty } from 'lodash'

const poolTogetherCampaignId = 23
const TABLE_NAME = 'ReferredUser'

export default async function handler (req, res) {
  // if (isDevEnv()) {
  //   return res.json({ referralCode: 'W92bWK7pzX' })
  // }

  const {
    referralCode,
    secret
  } = req.query

  if (secret !== process.env.TACIT_SERVER_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  if (isEmpty(referralCode)) {
    return res.status(400).json({
      message: 'Empty referral code'
    })
  }

  const address = req.query.address.toLowerCase()

  try {
    const supabase = getSupabaseClient()
    const {
      data: dataRead,
      error: errorRead
    } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('address', address)
      .eq('campaign_id', poolTogetherCampaignId)

    if (errorRead) {
      console.log(errorRead)
      return res.status(500).send('Error when getting data from supabase')
    }

    if (isEmpty(dataRead)) {
      const {
        data: referralCodeRead,
        error: errorReferralCodeRead
      } = await supabase
        .from('ReferralCodes')
        .select('*')
        .eq('referral_code', referralCode)
        .eq('campaign_id', poolTogetherCampaignId)

      if (errorReferralCodeRead) {
        console.log(errorReferralCodeRead)
        return res.status(500).send('Error when getting referral code data from supabase')
      }
      if (isEmpty(referralCodeRead)) {
        return res.status(400).json({ message: `Referral code ${referralCode} not registered` })
      } else if (referralCodeRead[0].address === address) {
        return res.status(400).json({ message: 'You cannot refer yourself' })
      }

      const {
        error: errorInsert
      } = await supabase
        .from(TABLE_NAME)
        .insert({
          address: address,
          referral_code: referralCode,
          campaign_id: poolTogetherCampaignId
        })
        .select()
      if (errorInsert) {
        console.log(errorInsert)
        return res.status(500).send('Error when inserting data to supabase')
      }
    } else {
      return res.status(200).json({ message: `You've submitted the referral code ${dataRead[0].referral_code} before` })
    }

    return res.status(200).json({ referralCode })
  } catch (err) {
    console.log('error', err)
    return res.status(500).send('Error creating referral code')
  }
}
