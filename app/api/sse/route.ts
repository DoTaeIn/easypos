export const dynamic = 'force-dynamic'; // Ensure it's not statically optimized

import { NextRequest } from 'next/server';
import { addClient, removeClient } from '@/app/lib/sse';

export async function GET(req: NextRequest) {

    const stream = new ReadableStream({
        start(controller) {
            console.log('Client connected');
            addClient(controller);
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
