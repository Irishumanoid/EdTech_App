import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import OpenAI from 'openai';
import { v1 as textToSpeech } from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';
import fs from 'fs/promises';
import {v4 as uuidv4} from 'uuid';
import { Child, GPTPrompt } from './promptObjs.mjs';

const projectId = process.env.GOOGLE_PROJECT_ID;
const ttsClient = new textToSpeech.TextToSpeechLongAudioSynthesizeClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  projectId: projectId, 
});
const storage = new Storage({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  projectId: projectId,
});


//language and [female voice key, male voice key]
const langToVoiceMap = {
  'English': ['en-US-Neural2-F', 'en-US-Polyglot-1'],
  'Mandarin': ['cmn-CN-Wavenet-D', 'cmn-CN-Wavenet-B'],
  'Spanish': ['es-US-Journey-F', 'es-ES-Standard-B'],
  'French': ['fr-FR-Neural2-C', 'fr-FR-Standard-D'],
  'Japanese': ['ja-JP-Neural2-B', 'ja-JP-Neural2-D'],
  'Russian': ['ru-RU-Wavenet-A', 'ru-RU-Wavenet-B'],
  'German': ['de-DE-Neural2-F', 'de-DE-Standard-H'],
  'Arabic': ['ar-XA-Standard-D', 'ar-XA-Wavenet-C']
}


export const readFile = async (filepath) => {
  let textInput;
  try {
    textInput = await fs.readFile(filepath, 'utf8');
  } catch (err) {
    console.error(err); 
  }
  return textInput;
}

/*const child1 = new Child("ella", "she", ["reading", "biking"]);
const child2 = new Child("bella", "she", ["reading", "swimming"]);
const prompt = new GPTPrompt([child1, child2], "story", 2, [2, 4], ["science fiction"], false, "other", "English");*/
// userPref is gptPrompt
const generateStory = async (userPref) => {
  const genClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const basePrompt = await readFile(path.resolve(process.cwd(), 'input.txt'));
  let customPrompt = await readFile(path.resolve(process.cwd(), 'customInput.txt'));
  console.log(userPref);

  customPrompt = customPrompt.replaceAll('{contentType}', userPref.contentType);
  customPrompt = customPrompt.replaceAll('{childName}', userPref.children[0].name);
  customPrompt = customPrompt.replace('{friendsNames}', 
    userPref.children.slice(1, userPref.children.length).map(child => child.name).join(', '));
  customPrompt = customPrompt.replace('{childsPreferences}', userPref.children[0].preferences.join(', '));
  customPrompt = customPrompt.replace('{friendsPreferences}', 
    userPref.children.slice(1, userPref.children.length).map(child => `${child.name}: ${child.preferences}`).join(', '));
  customPrompt = customPrompt.replace('{numWords}', userPref.numMins*150);
  customPrompt = customPrompt.replace('{lowerAge}', userPref.ageRange[0]);
  customPrompt = customPrompt.replace('{upperAge}', userPref.ageRange[1]);
  customPrompt = customPrompt.replace('{pronoun}', userPref.children[0].pronoun);
  customPrompt = customPrompt.replace('{plotArchetypes}', userPref.plotArchetypes.join(', '));
  customPrompt = customPrompt.replace('{otherInfo}', userPref.otherInfo);
  customPrompt = customPrompt.replace('{language}', userPref.language);
  if (userPref.generateKeywords) {
    customPrompt = customPrompt.replace('{keywordGen}', 'After the content, generate a list of these keywords and other keywords relevant to the child\'s topics of interest.');
  } else {
    customPrompt = customPrompt.replace('{keywordGen}', '');
  }

  const params = {
    messages: [{ role: 'user', content: basePrompt + customPrompt}],
    model: 'gpt-4o',
  };
  const chatCompletion = await genClient.chat.completions.create(params);
  return chatCompletion.choices[0]?.message?.content;
}

// generateStory(prompt);

export const synthesizeLongAudio = async (prompt, voiceGender, userId) => {
  let uuid = uuidv4();
  let language = prompt.language;
  let textInput = await generateStory(prompt);

  const input = {
    text: textInput,
  };

  const audioConfig = {
    audioEncoding: 'LINEAR16', 
  };

  const voiceName = langToVoiceMap[language][voiceGender == "Female" ? 0 : 1];
  const langCode = voiceName.split('-').slice(0, 2).join('-');
  console.log(`voice name: ${voiceName}`);
  const voice = {
    languageCode: langCode,
    name: voiceName,
  };

  const parent = `projects/${projectId}/locations/us-central1`;
  

  if (userId !== '') {
    uuid = `${userId}/${uuid}`;
  }
  const outputGcsUri = `gs://tts-pipeline-bucket/synthesized_audio/${uuid}.wav`;

  const request = {
    parent: parent,
    input: input,
    audioConfig: audioConfig,
    voice: voice,
    outputGcsUri: outputGcsUri,
  };


  const [operation] = await ttsClient.synthesizeLongAudio(request);
  
  console.log('Waiting for operation to complete...');
  
  const [response] = await operation.promise({ timeout: 300000 }); 
  console.log('Finished processing, check your GCS bucket to find your audio file.');
  console.log('Operation result:', response);
  return [uuid, textInput];
}

export const fetchStoryAudio = async (bucketName, uuid) => {
  try {
    const filename = `${uuid}.wav`;
    const [fileBuffer] = await storage.bucket(bucketName).file(`synthesized_audio/${filename}`).download();
    return fileBuffer;
  } catch (err) {
    console.error('Error fetching file: ', err);
    return null;
  }
}

export const fetchUserStoryIds = async (bucketName, userId) => {
  try {
    console.log(`bucket name: synthesized_audio/${userId}/`);
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: `synthesized_audio/${userId}/` });
    if (!files.length) {
      console.log('No files found for this user');
      return [];
    }
    
    let names = [];
    files.forEach(file => {
      const name = file.name.split('/').pop().split('.')[0]; 
      console.log(`name is ${name}`);
      names.push(name);
    });

    return names.filter(name => name !== '');
  } catch (err) {
    console.error('Error fetching file: ', err);
    return null;
  }
}

/*
const res = await fetchUserStoryIds('tts-pipeline-bucket', '6727015927cb1cc8847f7281');
console.log(res);*/
