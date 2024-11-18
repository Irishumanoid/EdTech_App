import { NextResponse } from 'next/server';
import { synthesizeLongAudio, readFile, fetchStoryAudio } from '@/lib/gptGen.mjs';
import { Child, GPTPrompt } from '@/lib/promptObjs.mjs';
import { ChildType } from '../../store/features/userStorySlice';
import { addStory } from '@/lib/mongodb';
import path from 'path';

interface ChildInfo {
    users: ChildType[]
}

// generate story (store in mongodb), generate audio (store in gcs)
export const POST = async (request: Request) => {
    console.log('POST is being invoked');
    const userInfo = await request.json();
    try {
        const childInfo: ChildInfo = {
            users: userInfo.users
        };

        let children: Child[] = [];
        if (childInfo.users.length !== 0) {
            children = childInfo.users.map(user => new Child(user.name, user.pronoun, user.preferences));
        }
        const gptPrompt = new GPTPrompt(children, userInfo.type, userInfo.numMins, userInfo.ageRange, userInfo.plots, userInfo.keywords, userInfo.otherInfo, userInfo.language);

        const uuid = await synthesizeLongAudio(gptPrompt);

        const filePath = path.resolve(process.cwd(), 'lib/stories', `${uuid}.txt`);
        const story = await readFile(filePath);
        if (story) {
            await addStory(story);
        } else {
            return NextResponse.json({message: 'Text file not found'}, {status: 404});
        }

        return NextResponse.json({message: 'Content generated sucessfully', uuid: uuid}, {status: 200});
    } catch (err) {
        console.error('An unexpected error occurred: ', err);
        return NextResponse.json({message: 'An unexpected error occurred'}, {status: 500});
    }
}


export const GET = async (request: Request) => {
    const uuid = request.headers.get('uuid');
    if (!uuid) {
        return NextResponse.json(
            { message: 'UUID is required' },
            { status: 400 }
        );
    }

    try {
        const audioBuffer = await fetchStoryAudio('tts-pipeline-bucket', uuid);
        if (audioBuffer) {
            return new NextResponse(audioBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'audio/wav',
                    'Content-Disposition': `attachment; filename="${uuid}.wav"`,
                },
            });
        } else {
            return NextResponse.json({message: 'Audio file not found'}, {status: 404});
        }
    } catch (err) {
        console.error('An unexpected error occurred: ', err);
        return NextResponse.json({message: 'An unexpected error occurred'}, {status: 500});
    }
}


