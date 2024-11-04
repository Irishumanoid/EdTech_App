import { NextResponse } from 'next/server';
import { fetchRegistration } from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const {email, username, password} = await request.json();
        if (!email || !username || !password) {
            return NextResponse.json({error: 'email, username, and password are required'}, {status: 400});
        }

        const result = await fetchRegistration(email, username, password);
        if (result?.body.includes('User already exists')) {
            return NextResponse.json({message: result}, {status: 400});
        }
        return NextResponse.json({message: 'User registered successfully'}, {status: 201});

    } catch (err) {
        console.error('An unexpected error occurred: ', err);
        return NextResponse.json({error: 'An unexpected error occurred'}, {status: 500});
    }
}
