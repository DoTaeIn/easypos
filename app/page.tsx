'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
    const [processingOrders, setProcessingOrders] = useState<string[]>([]);
    const [doneOrders, setDoneOrders] = useState<string[]>([]);
    const [totalOrder, setTotalOrder] = useState<string[]>([]);

    // Function to fetch the current orders
    const fetchOrders = async () => {
        const res = await fetch('/api/getorder');
        const data = await res.json();

        const processarr: string[] = [];
        const donearr: string[] = [];

        data.result.forEach((element: { orderstatus: number, orderid: string }) => {
            if (element.orderstatus === 0) {
                processarr.push(element.orderid);
            } else if (element.orderstatus === 1) {
                donearr.push(element.orderid);
            }
        });

        setProcessingOrders(processarr);
        setDoneOrders(donearr);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            fetchOrders();  // Fetch the latest orders every 5 seconds
        }, 1000);  // 5000 ms = 5 seconds

        return () => clearInterval(interval);  // Cleanup the interval when component unmounts
    }, []);

    // Set up the SSE connection to listen for updates
    useEffect(() => {
        const eventSource = new EventSource('/api/sse');  // Connect to the SSE endpoint

        eventSource.onmessage = function (event) {
            const message = JSON.parse(event.data);
            console.log("SSE message received:", message);

            // If the SSE trigger is received, refetch the data
            if (message.trigger) {
                console.log("Trigger received, refetching data...");
                fetchOrders();  // Refetch the orders when triggered
            }
        };

        eventSource.onerror = function (error) {
            console.error("SSE Error:", error);
        };

        // Clean up the SSE connection when the component unmounts
        return () => {
            eventSource.close();
        };
    }, []);  // This effect runs once when the component mounts, to set up the SSE connection

    // Fetch the orders initially when the component mounts
    useEffect(() => {
        fetchOrders();  // Initial fetch
    }, []);  // Only fetch once on component mount

    // Update the totalOrder array whenever processingOrders or doneOrders changes
    useEffect(() => {
        setTotalOrder([...processingOrders, ...doneOrders]);
    }, [processingOrders, doneOrders]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Order Status Checker</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>준비중...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {processingOrders.map((orderNumber) => (
                                <Card key={orderNumber} className="bg-yellow-100">
                                    <CardContent className="p-4 text-center">
                                        <span className="text-lg font-semibold">#{orderNumber}</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Separator className="hidden lg:block" orientation="vertical" />
                <Separator className="lg:hidden" />

                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>완료!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {doneOrders.map((orderNumber) => (
                                <Card key={orderNumber} className="bg-green-100">
                                    <CardContent className="p-4 text-center">
                                        <span className="text-lg font-semibold">#{orderNumber}</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
