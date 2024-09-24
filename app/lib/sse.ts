// /app/lib/sse.ts

let clients: any[] = []; // Store connected clients for SSE
export const dynamic = 'force-dynamic';

// Function to trigger an update to all connected clients
export function sendSSETrigger() {
    console.log("Triggering SSE to all clients...");
    clients.forEach((client) => {
        try {
            client.write(`data: ${JSON.stringify({ trigger: true })}\n\n`);
        } catch (error) {
            console.error("Error sending SSE update:", error);
        }
    });
}

// Function to add a new client to the SSE list
export function addClient(client: any) {
    clients.push(client);
}

// Function to remove a client from the SSE list
export function removeClient(client: any) {
    clients = clients.filter((c) => c !== client);
}
