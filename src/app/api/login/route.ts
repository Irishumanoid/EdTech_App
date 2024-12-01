import { NextResponse } from 'next/server';
import { verifyLogin } from '@/lib/mongodb';
import { fetchUserStoryIds } from '@/lib/gptGen.mjs';

export const POST = async (request: Request) => {
    try {
        const {email, password} = await request.json();
        if (!email || !password) {
            return NextResponse.json({message: 'email and password are required'}, {status: 400});
        }

        const result = await verifyLogin(email, password);
        const userId = JSON.parse(result?.body as string).userId;
        if (result?.statusCode !== 200) {
            return NextResponse.json({message: result?.body}, {status: 403});
        }
        return NextResponse.json({message: 'User logged in successfully', userId: userId}, {status: 200});

    } catch (err) {
        console.error('An unexpected error occurred: ', err);
        return NextResponse.json({message: 'An unexpected error occurred'}, {status: 500});
    }
}

export const GET = async (request: Request) => {
    const userId = request.headers.get('userId');
    try {
        const storyIds = await fetchUserStoryIds('tts-pipeline-bucket', userId);
        if (storyIds) {
            return NextResponse.json({message: 'Fetched story ids', storyIds: storyIds}, {status: 200});
        } else {
            return NextResponse.json({message: 'Story ids not found'}, {status: 404});
        }
    } catch (err) {
        console.error('An unexpected error occurred: ', err);
        return NextResponse.json({message: 'An unexpected error occurred'}, {status: 500});
    }
}