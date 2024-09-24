// /app/api/updatedata.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { sendSSETrigger } from '@/app/lib/sse'; // Import the SSE trigger function

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderid, orderstatus } = body;

        if (!orderid || orderstatus === undefined) {
            return NextResponse.json({ error: 'Missing required data: orderid or orderstatus' }, { status: 400 });
        }

        const conn = await pool.getConnection();
        const query = 'UPDATE easypos.order SET orderstatus = ? WHERE orderid = ?';
        const [result] = await conn.query(query, [orderstatus, orderid]);
        conn.release();

        // Trigger SSE to notify clients
        sendSSETrigger();

        return NextResponse.json({ message: 'Order updated successfully', result }, { status: 200 });
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
