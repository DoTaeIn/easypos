// /app/api/sse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { addClient, removeClient } from '@/app/lib/sse';

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();

    // Create a new ReadableStream to handle SSE data streaming
    const stream = new ReadableStream({
        start(controller) {
            console.log('Client connected');

            // Write necessary headers for SSE
            controller.enqueue(encoder.encode('Content-Type: text/event-stream\n'));
            controller.enqueue(encoder.encode('Cache-Control: no-cache\n'));
            controller.enqueue(encoder.encode('Connection: keep-alive\n'));

            // Add the client to the list of connected clients
            addClient(controller);

            // Remove client when connection is closed
            req.signal.addEventListener('abort', () => {
                console.log('Client disconnected');
                removeClient(controller);
                controller.close();
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
