import { setStoryName } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
    const storyId = request.headers.get('storyId');
    const storyName = request.headers.get('name');

    try {
        const result = await setStoryName(storyId as string, storyName as string);
        return NextResponse.json({message: 'Attempted to set story name'}, {status: result?.statusCode});
    } catch (error) {
        console.error('An unexpected error occurred setting story name: ', error);
        return NextResponse.json({message: 'An unexpected error occurred'}, {status: 500});
    }
}
