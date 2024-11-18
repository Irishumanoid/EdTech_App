import { NextResponse } from 'next/server';
import { verifyLogin } from '@/lib/mongodb';

export const POST = async (request: Request) => {
    try {
        const {email, password} = await request.json();
        if (!email || !password) {
            return NextResponse.json({message: 'email and password are required'}, {status: 400});
        }

        const result = await verifyLogin(email, password);
        if (result?.statusCode !== 200) {
            return NextResponse.json({message: result?.body}, {status: 403});
        }
        return NextResponse.json({message: 'User logged in successfully'}, {status: 200});

    } catch (err) {
        console.error('An unexpected error occurred: ', err);
        return NextResponse.json({message: 'An unexpected error occurred'}, {status: 500});
    }
}
