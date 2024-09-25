import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/app/lib/db';  // Your DB connection

const SECRET_KEY = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userid, userpwd } = body;

        if (!userid || !userpwd) {
            return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
        }

        const conn = await pool.getConnection();

        // Query the database to find the user by userid
        const query = "SELECT usrpswd FROM users WHERE userid = ?";
        const [rows] = await conn.query(query, [userid]);
        conn.release();

        // If user not found
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const storedPassword = rows[0].usrpswd;

        // Check if the stored password matches the provided password (assume bcrypt comparison in production)
        if (storedPassword !== userpwd) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // If credentials are valid, generate the JWT token
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const token = jwt.sign({ userid }, SECRET_KEY, { expiresIn: '24h' });

        // Set the token in cookies with a custom name
        const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
        response.cookies.set('authToken', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 }); // Set cookie for root path

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
