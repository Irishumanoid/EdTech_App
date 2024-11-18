import path from 'path';
import OpenAI from 'openai';
import { v1 as textToSpeech } from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';
import fs from 'fs/promises';
import {v4 as uuidv4} from 'uuid';
import { Child, GPTPrompt } from './promptObjs.mjs';


const projectId = "tts-pipeline";
const ttsClient = new textToSpeech.TextToSpeechLongAudioSynthesizeClient();
const storage = new Storage();
let uuid = uuidv4();

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
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
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
  customPrompt = customPrompt.replace('{language}', userPref.langauge);
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

//generateStory(prompt);

export const synthesizeLongAudio = async (prompt) => {
  let textInput = await generateStory(prompt);

  const filePath = path.resolve(process.cwd(), 'lib/stories', `${uuid}.txt`);
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.writeFile(filePath, textInput);
    console.log(`File written at ${filePath}`);
  } catch (err) {
    console.error('Error writing file:', err);
    throw new Error('Failed to write story file');
  }

  const input = {
    text: textInput,
  };

  const audioConfig = {
    audioEncoding: 'LINEAR16', 
  };

  const voice = {
    languageCode: 'en-US',
    name: 'en-US-Standard-A',
  };

  const parent = `projects/${projectId}/locations/us-central1`;
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
  return uuid;
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
