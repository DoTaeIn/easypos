'use client'

import {useEffect, useState} from 'react'
import { Button } from "@/components/ui/button"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {getSpeech} from "@/app/lib/voiceTTS";

//@ts-ignore
const Home:React.FC = () => {


    const [currentNumber, setCurrentNumber] = useState('')
    const [processingOrders, setProcessingOrders] = useState<string[]>([])
    const [doneOrders, setDoneOrders] = useState<string[]>([])
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    const [loading, setLoading] = useState(false); // New loading state

    const [data, setData] = useState<string[]>([])

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        loadVoices(); // Load voices immediately

        // Attach the event listener in case voices are not immediately available
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);


    useEffect(() => {
        fetch('/api/getorder').then((res) => res.json())
            .then((data) => {
                const processarr: string[] = [];  // Explicitly typing processarr as string[]
                const donearr: string[] = [];

                console.log(data)

                data.result.forEach((element: { orderstatus: number; orderid: string }) => {
                    if(element.orderstatus == 0){
                        processarr.push(element.orderid)
                    }
                    else if(element.orderstatus == 1){
                        donearr.push(element.orderid)
                    }
                })

                setProcessingOrders(processarr)
                setDoneOrders(donearr)
            });


    }, []);


    const refreshData = () => {
        fetch('/api/getorder').then((res) => res.json())
            .then((data) => {
                const processarr: string[] = [];  // Explicitly typing processarr as string[]
                const donearr: string[] = [];

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

                setProcessingOrders(processarr)
                setDoneOrders(donearr)
            });
    }


    const handleNumberClick = (num: string) => {
        setCurrentNumber(prev => prev + num)
    }

    const handleDelete = () => {
        // If currentNumber exists in processingOrders or doneOrders, remove it
        setProcessingOrders(prevProcessingOrders =>
            prevProcessingOrders.filter(order => order !== currentNumber)
        );
        setDoneOrders(prevDoneOrders =>
            prevDoneOrders.filter(order => order !== currentNumber)
        );

        // Delete the last digit from currentNumber as before
        setCurrentNumber(prev => prev.slice(0, -1));
    };

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
    }


    const handleDoneClick = async (orderNumber: string) => {
        setProcessingOrders(prevProcessingOrders =>
            prevProcessingOrders.filter(order => order !== orderNumber)
        );
        setDoneOrders(prevDoneOrders => [...prevDoneOrders, orderNumber]);

        // Update the order status to "done" (for example, status = 1)
        await updateOrderStatus(orderNumber, 1);

        // Only call getSpeech if voices are loaded
        if (voices && voices.length > 0) {
            getSpeech(`${orderNumber}번 고객님 주문하신 음료가 준비 되었습니다.`, voices);
        } else {
            console.error("No voices available or voices not loaded yet.");
        }
    };

    const handleCancelDoneClick = async (orderNumber: string) => {
        setDoneOrders(prevDoneOrders =>
            prevDoneOrders.filter(order => order !== orderNumber)
        );
        setProcessingOrders(prevProcessingOrders => [...prevProcessingOrders, orderNumber]);

        // Update the order status to "processing" (for example, status = 0)
        await updateOrderStatus(orderNumber, 0);
    };

    const handleEnter = async () => {
        if (currentNumber && !isNumberInOrders(currentNumber)) {
            try {
                setLoading(true); // Disable the button
                await updateData();

                setCurrentNumber('');
                refreshData();
            } catch (error) {
                console.error("Failed to update data:", error);
            } finally {
                setLoading(false); // Re-enable the button once the query is complete
            }
        }
    };



    const updateData = async () => {
        const data = {
            orderid: currentNumber,
            orderstatus: 0
        }

        try{
            const response = await fetch('/api/postorder',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
                }
            );

            if(!response.ok){
                throw new Error(`Failed to update data: ${response.status}`);
            }

            const result = await response.json();
            console.log(`Data sent Successfully : ${JSON.stringify(result)}`);

        }catch(error){
            console.error("Failed to update data:", error)
        }

        fetch('/api/getorder').then((res) => res.json())
            .then((data) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                const arr = [];

                console.log(data)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                data.result.forEach((element) => {
                    arr.push(element.orderid)
                })

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setData(arr)
            });
    }





    const isNumberInOrders = (num: string) => {
        return processingOrders.includes(num) || doneOrders.includes(num);
    }

    return (
        <div className="container mx-auto p-8">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl">Order Number Entry</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="text-xl">준비중...</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[400px] pr-4">
                                        <div className="space-y-2">
                                            {processingOrders.map((num, index) => (
                                                <Button
                                                    key={index}
                                                    variant="secondary"
                                                    className="w-full justify-start text-lg py-3"
                                                    onClick={() => handleDoneClick(num)}
                                                >
                                                    {num}
                                                </Button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="text-xl">완료!</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[400px] pr-4">
                                        <div className="space-y-2">
                                            {doneOrders.map((num, index) => (
                                                <Button
                                                    key={index}
                                                    variant="secondary"
                                                    className="w-full justify-start text-lg py-3"
                                                    onClick={() => handleCancelDoneClick(num)}
                                                >
                                                    {num}
                                                </Button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <p className="text-4xl font-bold text-center">{currentNumber || '0'}</p>
                                </CardContent>
                            </Card>
                            <div className="grid grid-cols-3 gap-4">
                                {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map((num) => (
                                    <Button key={num} onClick={() => handleNumberClick(num.toString())}
                                            className="text-2xl py-8">
                                        {num}
                                    </Button>
                                ))}
                                <Button variant="destructive" onClick={handleDelete}
                                        className="text-xl py-8">Delete</Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleEnter}
                                    className="text-xl py-8"
                                >
                                    Enter
                                </Button>


                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>

                </CardFooter>
            </Card>
        </div>
    )
}

export default Home;
