import { File, Web3Storage } from 'web3.storage'
import crypto from 'crypto'

function getFileFromObject (obj, filename) {
  const buffer = Buffer.from(JSON.stringify(obj))
  return new File([buffer], filename)
}

function makeStorageClient () {
  return new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN })
}

export async function storeObjectInIPFS (obj, filename) {
  const client = makeStorageClient()
  const files = [getFileFromObject(obj, filename)]
  const cid = await client.put(files)
  console.log('stored files with cid:', cid)
  return cid
}

export function generateHashForObject (obj) {
  return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex')
}

export async function getObjectInIPFS (cid, fname) {
  console.log('retrieving object in ipfs with cid', cid)
  const client = makeStorageClient()
  const res = await client.get(cid)
  console.log(`ipfs response ${res.status}`)
  if (!res.ok) {
    throw new Error(`failed to get ${cid}`)
  }

  const files = await res.files()
  for (const file of files) {
    // console.log(`${file.cid} -- ${file.name} -- ${file.size}`)
    if (file.name === fname) {
      return JSON.parse(await file.text())
    }
  }
  return null
}
