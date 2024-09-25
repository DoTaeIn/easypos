import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET() {
    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.query("SELECT * FROM easypos.order;");

        conn.release(); // Ensure the connection is released

        return NextResponse.json({
            result: rows,
        }, { status: 200 });

    } catch (err) {
        return NextResponse.json({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            error: err.message,
        }, { status: 500 });
    }
}
