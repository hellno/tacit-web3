import { NextResponse } from 'next/server'

export async function middleware (req, ev) {
  const { pathname } = req.nextUrl
  if (pathname === '/') {
    return NextResponse.rewrite(new URL('/referral', req.url))
  }
  return NextResponse.next()
}
