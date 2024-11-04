import { NextResponse } from 'next/server';
import { verifyLogin } from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const {email, password} = await request.json();
        if (!email || !password) {
            return NextResponse.json({error: 'email and password are required'}, {status: 400});
        }

        const result = await verifyLogin(email, password);
        if (result?.statusCode !== 200) {
            return NextResponse.json({message: result}, {status: 403});
        }
        return NextResponse.json({message: 'User logged in successfully'}, {status: 200});

    } catch (err) {
        console.error('An unexpected error occurred: ', err);
        return NextResponse.json({error: 'An unexpected error occurred'}, {status: 500});
    }
}
