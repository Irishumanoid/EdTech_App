import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const audioBufferToWav = (buffer: AudioBuffer): Blob => {
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
  const wavBlob = audioBufferToWav(buffer);
  return URL.createObjectURL(wavBlob);
}