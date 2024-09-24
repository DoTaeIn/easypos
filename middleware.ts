import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'test'); // Needs to be an encoded Uint8Array

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        if (payload.userid === 'admin') {
            return NextResponse.next(); // Allow access
        } else {
            return NextResponse.redirect(new URL('/unauthorized', request.url)); // Redirect unauthorized users
        }
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        console.error('Token verification failed:', error.message);
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/admin/:path*'], // Protect all /admin routes
};
