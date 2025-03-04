import { NextResponse } from 'next/server';
import { getStory, synthesizeLongAudio, fetchStoryAudio, deleteStory } from '@/lib/gptGen.mjs';
import { Child, GPTPrompt } from '@/lib/promptObjs.mjs';
import { ChildType } from '../../store/features/userStorySlice';
import { addStory, fetchStory, deleteStoryText } from '@/lib/mongodb';

interface ChildInfo {
    users: ChildType[]
}

// generate story (store in mongodb), generate audio (store in gcs)
export const POST = async (request: Request) => {
    const type = request.headers.get('type');

    try {
        if (type === 'text') {
            const userInfo = await request.json();
            const childInfo: ChildInfo = {
                users: userInfo.users
            };
    
            let children: Child[] = [];
            if (childInfo.users.length !== 0) {
                children = childInfo.users.map(user => new Child(user.name, user.pronoun, user.preferences));
            }
            const gptPrompt = new GPTPrompt(children, userInfo.type, userInfo.numMins, userInfo.ageRange, userInfo.plots, userInfo.keywords, userInfo.otherInfo, userInfo.language);
    
    
            const [uuid, story] = await getStory(gptPrompt);
            if (story) {
                await addStory(story, uuid as string);
                return NextResponse.json({message: 'Story generated sucessfully', uuid: uuid}, {status: 201});
            } else {
                return NextResponse.json({message: 'Text file not found'}, {status: 404});
            }
        } else if (type === 'audio') {
            const transcript = await request.json();
            const uuid = request.headers.get('uuid');
            const userId = request.headers.get('userId');
            const language = request.headers.get('language');
            const voiceGender = request.headers.get('voiceGender');

            console.log(`uuid is: ${uuid}`);
            console.log(`user id is: ${userId}`);
            try {
                const response = await synthesizeLongAudio(transcript, language, voiceGender, uuid, userId);
                // TODO handle if response contains raw audio (not logged in)
                if (response) {
                    return new NextResponse(response, {
                        status: 200,
                        headers: {
                            'Content-Type': 'audio/wav',
                            'Content-Disposition': `attachment; filename="${uuid}.wav"`,
                        },
                    });
                } else {
                    return NextResponse.json({message: 'Audio generated sucessfully', uuid: uuid}, {status: 201});
                }
            } catch (error) {
                return NextResponse.json({message: 'Failed to generate content audio'}, {status: 500});
            }
        } else {
            console.error('Invalid file type attempted to be accessed');
            return NextResponse.json({message: 'Invalid file type fetch'}, {status: 415});
        }

        
    } catch (error) {
        console.error('An unexpected error occurred: ', error);
        return NextResponse.json({message: 'An unexpected error occurred'}, {status: 500});
    }
}


export const GET = async (request: Request) => {
    const uuid = request.headers.get('uuid');
    const fetchType = request.headers.get('type');

    if (!uuid) {
        return NextResponse.json(
            { message: 'UUID is required' },
            { status: 400 }
        );
    }

    try {
        if (fetchType == 'audio') {
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
        } else if (fetchType == 'text') {
            const output = await fetchStory(uuid, false);
            const story = JSON.parse(output?.body || '{"content": ""}').content;
            if (story) {
                return new NextResponse(story, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/plain',
                        'Content-Disposition': `attachment; filename="${uuid}.txt"`,
                    }
                });
            } else {
                return NextResponse.json({message: 'Text file not found'}, {status: 404});
            }
        } else if (fetchType == 'storyName') {
            const output = await fetchStory(uuid, true);
            const storyName = JSON.parse(output?.body || '{"content": ""}').content;
            return NextResponse.json({message: 'Successfully fetched story name', name: storyName}, {status: 200});
        } else {
            console.error('Invalid fetch type attempted to be accessed');
            return NextResponse.json({message: 'Invalid file type fetch'}, {status: 415});
        }
    } catch (error) {
        console.error('An unexpected error occurred: ', error);
        return NextResponse.json({message: 'An unexpected error occurred'}, {status: 500});
    }
}

export const DELETE = async (request: Request) => {
    const userId = request.headers.get('uuid');

    if (!userId) {
        return NextResponse.json(
            { message: 'uuid is required for content deletion' },
            { status: 400 }
        );
    }
    try {
        await deleteStory('tts-pipeline-bucket', userId);
        await deleteStoryText(userId);
        return NextResponse.json({message: 'Successfully deleted content'}, {status: 200});
    } catch (error) {
        console.error('An unexpected error occurred: ', error);
        return NextResponse.json({message: 'An unexpected error occurred during content deletion'}, {status: 500});
    }
}


