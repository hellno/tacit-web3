import { join } from 'lodash'
import { isDevEnv } from '../../../src/utils'

export default async function handler (req, res) {
  if (isDevEnv()) {
    return res.json({ revalidated: true })
  }

  const {
    secret,
    path
  } = req.query

  if (secret !== process.env.TACIT_SERVER_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  try {
    const revalidatePath = join(path, '/')
    await res.revalidate(revalidatePath)
    return res.json({ revalidated: true })
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send('Error revalidating')
  }
}
