import { v1 as textToSpeech } from '@google-cloud/text-to-speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import {v4 as uuidv4} from 'uuid';

/** google cloud tts story generation pipeline test */
const projectId = "tts-pipeline";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
let saveDir;

const generateStory = async (prompt) => {
  const result = await model.generateContent(`Generate a story based on the following preferences: ${prompt}`);
  return result.response.text();
}

const writeStoryToFile = async (prompt) => {
  try {
    const out = await generateStory(prompt);
    saveDir = `stories/story-${uuidv4()}.txt`;
    await fs.writeFile(saveDir, out);
    console.log('Story written to storyOut.txt successfully!');
    synthesizeLongAudio(saveDir);
  } catch (err) {
    console.error('Error writing story to file:', err);
  }
};

const readFile = async (filepath) => {
  let textInput;
  try {
    textInput = await fs.readFile(filepath, 'utf8');
  } catch (err) {
    console.error(err); 
  }
  return textInput;
}


const synthesizeLongAudio = async (storyPath) => {
  const client = new textToSpeech.TextToSpeechLongAudioSynthesizeClient();

  let textInput = await readFile(storyPath);
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
  const outputGcsUri = `gs://tts-pipeline-bucket/synthesized_audio/${uuidv4()}.wav`;

  const request = {
    parent: parent,
    input: input,
    audioConfig: audioConfig,
    voice: voice,
    outputGcsUri: outputGcsUri,
  };


  const [operation] = await client.synthesizeLongAudio(request);
  
  console.log('Waiting for operation to complete...');
  
  const [response] = await operation.promise({ timeout: 300000 }); 
  console.log('Finished processing, check your GCS bucket to find your audio file.');
  console.log('Operation result:', response);
}

const basePrompt = await readFile("input.txt");
writeStoryToFile(basePrompt + "Three children run through a forest")
  .catch(err => {
    console.error('ERROR:', err);
  });

export default generateStory;