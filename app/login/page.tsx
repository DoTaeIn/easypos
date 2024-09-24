'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";  // Use Next.js router for navigation

const JWT_TOKEN = process.env.JWT_TOKEN;
const TESET = process.env.DB_NAME;

export default function Home() {
    const [id, setId] = useState<string>('');
    const [pwd, setPwd] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();  // To redirect after login

    useEffect(() => {
        console.log(JWT_TOKEN)
        console.log(TESET)
    })

    const tesetLogin = async () => {
        if (!pwd || !id) {
            setError('Please enter both username and password');
            return;
        }

        try {
            const response = await fetch(`/api/login`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userid: id, userpwd: pwd }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || `Failed to log in`);
            }

            const result = await response.json();

            if (result.message === "Login successful") {
                // You can store the JWT token in localStorage or let the middleware handle the cookie set by the API
                console.log("Login successful");
                router.push('/'); // Redirect to a protected page like dashboard
            } else {
                setError("Invalid credentials");
            }
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setError(error.message);
        }
    };

    return (
        <div key="1" className="h-screen flex justify-center items-center">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your username and password to access your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            placeholder="Enter your username"
                            required
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            required
                            type="password"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                        />
                    </div>
                    {error && (
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        <Alert className="mt-4 text-center" variant="warning">
                            {error}
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={tesetLogin}>Log in</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
