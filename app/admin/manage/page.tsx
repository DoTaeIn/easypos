'use client'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {useEffect, useState} from "react";

export default function Home() {
    const [doneOrders, setDoneOrders] = useState<string[]>([]);
    const [processingOrders, setProcessingOrders] = useState<string[]>([]);
    const [totalOrder, setTotalOrder] = useState<string[]>([]);

    // Fetch orders from the API when the component mounts
    useEffect(() => {
        fetch('/api/getorder').then((res) => res.json())
            .then((data) => {
                const processarr: string[] = [];  // Explicitly typing processarr as string[]
                const donearr: string[] = [];

                console.log(data)

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                data.result.forEach((element) => {
                    if (element.orderstatus == 0) {
                        processarr.push(element.orderid)
                    } else if (element.orderstatus == 1) {
                        donearr.push(element.orderid)
                    }
                })

                setProcessingOrders(processarr);
                setDoneOrders(donearr);
            });
    }, []);

    // Update totalOrder whenever processingOrders or doneOrders change
    useEffect(() => {
        setTotalOrder([...processingOrders, ...doneOrders]);
    }, [processingOrders, doneOrders]); // Dependency array

    const getData = () => {
        fetch('/api/getorder').then((res) => res.json())
            .then((data) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                const processarr = [];
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                const donearr = [];

                console.log(data)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                data.result.forEach((element) => {
                    if(element.orderstatus == 0){
                        processarr.push(element.orderid)
                    }
                    else if(element.orderstatus == 1){
                        donearr.push(element.orderid)
                    }
                })
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setProcessingOrders(processarr)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setDoneOrders(donearr)
            });
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error

    const updateOrderStatus = async (orderid, newStatus) => {
        const data = {
            orderid: orderid,
            orderstatus: newStatus
        }

        try {
            const response = await fetch('/api/updatedata', {
                method: 'PATCH', // Using PATCH for partial updates
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Failed to update data: ${response.status}`);
            }

            const result = await response.json();
            console.log(`Order updated successfully: ${JSON.stringify(result)}`);

        } catch (error) {
            console.error("Failed to update data:", error);
        }

        getData();
    }

    const handleDone = (orderNumber : string) => {
        setProcessingOrders(orders =>
            orders.filter(order => order !== orderNumber) // Remove from processingOrders
        );

        setDoneOrders(prevDoneOrders => [...prevDoneOrders, orderNumber]);

        updateOrderStatus(orderNumber, 1);
    }

    const handleProcess = (orderNumber: string) => {
        setDoneOrders(orders =>
            orders.filter(order => order !== orderNumber) // Remove from doneOrders
        );

        setProcessingOrders(prevProcessingOrders => [...prevProcessingOrders, orderNumber]);

        updateOrderStatus(orderNumber, 0);
    }


    const handleDelete = (orderNumber : string) => {
        setProcessingOrders(prevProcessingOrders =>
            prevProcessingOrders.filter(order => order !== orderNumber)
        );
        setDoneOrders(prevDoneOrders =>
            prevDoneOrders.filter(order => order !== orderNumber)
        );

        updateOrderStatus(orderNumber, 2);
    }

    return (
        <main className="p-6 bg-white dark:bg-gray-900 h-screen overflow-auto">
            <h1 className="text-xl md:text-2xl font-bold mb-4">Order Receiving Panel</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {totalOrder.map((orderNumber) => {
                    // Determine the status of the order
                    const status = doneOrders.includes(orderNumber) ? 'done' : 'processing';

                    return (
                        <CardPrefab
                            key={orderNumber}
                            orderNum={orderNumber}
                            status={status}
                            handleDone={handleDone}
                            handleProcess={handleProcess}
                            handleDelete={handleDelete}
                        />
                    );
                })}
            </div>
        </main>
    )
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function CardPrefab({orderNum, status, handleDone, handleProcess, handleDelete}){

    const handleDoneButton = () => {
        handleDone(orderNum)
    }

    const handleProcessButton = () => {
        handleProcess(orderNum)
    }

    const handleDeleteButton = () => {
        handleDelete(orderNum)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order #{orderNum}</CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <p className="font-semibold">Status: {status}</p>
                </div>

                <Button className="w-full h-28 mb-4" disabled={status == 'done'} onClick={handleDoneButton}>완료 처리</Button>
                <Button className="w-full h-28 mb-4" disabled={status == 'processing'} onClick={handleProcessButton}>준비중 처리</Button>
                <Button className="w-full h-28 mb-4" onClick={handleDeleteButton}>삭제 처리</Button>

            </CardContent>
        </Card>
    )
}
