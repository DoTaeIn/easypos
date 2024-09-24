import {NextResponse} from "next/server";
import pool from "@/app/lib/db";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export async function POST(req) {
    try {
        // Await the body parsing since it returns a promise
        const body = await req.json();
        const { orderid, orderstatus } = body;

        // Validate the input
        if (!orderid) {
            return NextResponse.json(
                { error: "Missing required data: orderid" },
                { status: 400 }
            );
        }

        // Get the connection
        const conn = await pool.getConnection();

        // Insert the data into the database
        const query = 'INSERT INTO easypos.order (orderid, orderstatus) VALUES (?, ?)';
        const [result] = await conn.query(query, [orderid, orderstatus]);

        // Release the connection
        conn.release();

        // Return success response
        return NextResponse.json({
            message: "Data sent successfully",
            result: result,
        }, { status: 201 });

    } catch (err) {
        // Handle error and return response
        return NextResponse.json({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            error: err.message,
        }, { status: 500 });
    }
}
