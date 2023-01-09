import { customAlphabet } from 'nanoid'
import { getSupabaseClient } from '../../src/supabase'
import { isEmpty } from 'lodash'
import { isDevEnv } from '../../src/utils'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 10)

const poolTogetherCampaignId = 23
const TABLE_NAME = 'ReferralCodes'

export default async function handler (req, res) {
  if (isDevEnv()) {
    return res.json({ referralCode: 'W92bWK7pzX' })
  }

  const { secret } = req.query

  if (secret !== process.env.TACIT_SERVER_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  const address = req.query.address.toLowerCase()

  try {
    let referralCode
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

    console.log('dataRead', dataRead, isEmpty(dataRead))
    if (isEmpty(dataRead)) {
      referralCode = nanoid()
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
      referralCode = dataRead[0].referral_code
    }

    return res.status(200).json({ referralCode })
  } catch (err) {
    console.log('error', err)
    return res.status(500).send('Error creating referral code')
  }
}
