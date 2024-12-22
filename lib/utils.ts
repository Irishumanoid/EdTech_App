import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const audioBufferToWav = (buffer: AudioBuffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;

  const dataLength = numFrames * numChannels * 2; // 2 bytes per sample (16-bit PCM)
  const bufferLength = 44 + dataLength; // WAV header size is 44 bytes
  const wavBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(wavBuffer);

  // Write WAV header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataLength, true); // File size - 8 bytes
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1 size (16 for PCM)
  view.setUint16(20, 1, true); // Audio format (1 = PCM)
  view.setUint16(22, numChannels, true); // Number of channels
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, sampleRate * numChannels * 2, true); // Byte rate
  view.setUint16(32, numChannels * 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample (16)
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLength, true); // Subchunk2 size

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
          const sample = buffer.getChannelData(channel)[i];
          const int16 = Math.max(-1, Math.min(1, sample)) * 0x7FFF; // Clamp and scale to 16-bit PCM
          view.setInt16(offset, int16, true);
          offset += 2;
      }
  }
  return new Blob([wavBuffer], { type: "audio/wav" });
};

export const getBlobUrl = (buffer: AudioBuffer) => {
  const wavBlob = audioBufferToWav(buffer) as Blob;
  return URL.createObjectURL(wavBlob);
}

export const downloadStory = (audioSrc: string, story: string[]) => {
  const audioLink = document.createElement('a');
  audioLink.href = audioSrc;
  audioLink.download = 'audio-file.wav'; 
  audioLink.click();

  const textContent = story.join(' ');
  const textBlob = new Blob([textContent], { type: 'text/plain' });
  const textLink = document.createElement('a');
  textLink.href = URL.createObjectURL(textBlob);
  textLink.download = 'story.txt';
  textLink.click();

  URL.revokeObjectURL(audioSrc);
}


export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
});



export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Flip {
  horizontal: boolean;
  vertical: boolean;
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation: number = 0,
  flip: Flip = { horizontal: false, vertical: false }
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated image
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    return null;
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Return a Blob as a Base64 string
  return new Promise<string | null>((resolve, reject) => {
    croppedCanvas.toBlob(
      (file) => {
        if (file) {
          resolve(URL.createObjectURL(file));
        } else {
          reject(new Error('Could not create Blob from canvas'));
        }
      },
      'image/jpeg'
    );
  });
}