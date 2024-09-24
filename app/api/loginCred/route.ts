import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(req: NextRequest) {
    try {
        // Parse JSON request body
        const body = await req.json();

        // Check if userid and userpwd are provided
        const { userid, userpwd } = body;
        if (!userid || !userpwd) {
            return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
        }

        const conn = await pool.getConnection();

        // Query to check if the user exists
        const query = "SELECT usrpswd FROM easypos.users WHERE userid = ?;";
        const [rows] = await conn.query(query, [userid]);

        conn.release(); // Release the connection

        // Check if user exists
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (rows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }


        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const storedPassword = rows[0].usrpswd;

        // Compare the provided password with the stored one
        if (storedPassword !== userpwd) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        // If login successful
        return NextResponse.json({ message: "Login successful" }, { status: 200 });

    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        console.error("Error occurred during login:", err.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
