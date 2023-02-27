import { customAlphabet } from 'nanoid'
import { getSupabaseClient } from '../../src/supabase'
import { includes, isEmpty } from 'lodash'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 10)

const poolTogetherCampaignId = 23
const TABLE_NAME = 'ReferralCodes'

// must be lowercase addresses
const ALLOWLIST = [
  '0x4f49d938c3ad2437c52eb314f9bd7bdb7fa58da9',
  '0xa4bd0ec4dd0f92c3e3cd9e431bb9085b0dc631a6',
  '0x4c86f1fd67daf44e4e8c95900c6db5953cca69e5',
  '0xe9945b3acbdc2f9dcad8871f01aa9dabbb20d882',
  '0x175c4f84f41bd3dc37a42d8260f57bc5475e9753',
  '0xf1321ea3e31b1875cf8b9e3aae78bd043509205c',
  '0x5ecb7bedc7f65d9956c5ad2bf54aa8c80c0d2aed',
  '0x2753c791bca3667f10800262fcb0168269e12dc5',
  '0xc751fb28553c9d482af92f57aaaf72d79cec70dc',
  '0x60c0e5e23790a7b9b38a095d8c6291a88a23e6b6',
  '0x15e9bc2bebccf1ffb4b955655a7666f509e66dbe',
  '0x3994537274f3ff3eefc413e0d669b05d6446d46b',
  '0x2c1cb4478b1b04daee8cbed25dcf404be6479cfd',
  '0xacd5443c888301bc2a767db1b11d1c7e5fa98002',
  '0x41f1f38bd2c3f8f49d73c59c1247b3ffafb5e14f',
  '0xa184aa8488908b43ccf43b5ef13ae528693dfd00',
  '0xe9945b3acbdc2f9dcad8871f01aa9dabbb20d882',
  '0xeaba588d42d7f13048bd5795372530ac98cbd34f',
  '0xeaba588d42d7f13048bd5795372530ac98cbd34f',
  '0x0b58857708a6f84e7ee04beaef069a7e6d1d4a0b',
  '0xf77e2c9b9ea81843d97a034e50aaa61b54edcc92',
  '0x11b9dd6d3129eb740011b1a948adcbcb67758a10',
  '0x5f1cecc3d3b366b6fc9f3c6bad389c8739735c48'
]

export default async function handler (req, res) {
  // if (isDevEnv()) {
  //   return res.json({ referralCode: 'W92bWK7pzX' })
  // }

  const { secret } = req.query

  if (secret !== process.env.TACIT_SERVER_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  const address = req.query.address.toLowerCase()
  if (!includes(ALLOWLIST, address)) {
    return res.status(400).json({ message: `Address ${address} is not on allow list` })
  }

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
