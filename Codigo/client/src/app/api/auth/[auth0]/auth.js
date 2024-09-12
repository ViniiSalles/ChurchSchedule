import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH0_SECRET));
    req.user = payload; // Attach user information to the request object
    return NextResponse.next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

