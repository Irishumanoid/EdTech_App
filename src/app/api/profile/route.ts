import { NextResponse } from "next/server";
import { updateUser, fetchUserData } from "@/lib/mongodb";
import { uploadImage, fetchImage } from "@/lib/gptGen.mjs";

export const config = {
    api: {
        bodyParser: false, //handle form data manually
    },
};

export const POST = async (request: Request) => {
    const type = request.headers.get('type');
    const userId = request.headers.get('userId');

    let result;
    if (type === 'image') {
        const filetype = request.headers.get('filetype');
        const formData = await request.formData();
        const image = formData.get('image');

        if (image && image instanceof Blob) {
            const buffer = Buffer.from(await image.arrayBuffer());
            result = await uploadImage('tts-pipeline-bucket', `profile_pictures/${userId}`, buffer, filetype);
        }
    } else if (type === 'bio') {
        const bio = request.headers.get('bio');
        result = await updateUser(userId as string, undefined, bio as string);
    } else if (type == 'username') {
        const username = request.headers.get('username');
        result = await updateUser(userId as string, username as string);
    } else {
        console.error('Invalid fetch type attempted to be accessed');
        return NextResponse.json({message: 'Invalid file type fetch'}, {status: 415});
    }
    return NextResponse.json({message: `Updated ${type}`}, {status: result?.statusCode});
}

export const GET = async (request: Request) => {
    const userId = request.headers.get('userId');

    try {
        const username = await fetchUserData(userId as string, 'username');
        let usernameRes = '';
        if (username?.statusCode === 200) {
            usernameRes = JSON.parse(username.body).data;
        }

        const bio = await fetchUserData(userId as string, 'bio');
        let bioRes = '';
        if (bio?.statusCode === 200) {
            bioRes = JSON.parse(bio.body).data;
        }
        
        const imResult = await fetchImage('tts-pipeline-bucket', `profile_pictures/${userId}`);
        if (imResult) {
            const imageBuffer = imResult[0];
            const type = imResult[1];
            
            return new NextResponse(imageBuffer, {
                status: 200,
                headers: {
                    'Content-Type': type,
                    'Content-Disposition': `attachment`,
                    'bio': bioRes,
                    'username': usernameRes
                },
            });
        }

        return new NextResponse(null, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': 'attachment',
                'bio': bioRes,
                'username': usernameRes,
            },
        });
        
    } catch (error) {
        return NextResponse.json({message: `Failed to fetch user data for user: ${userId}`}, {status: 500});
    }
}