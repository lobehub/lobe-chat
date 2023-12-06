import { FileStore } from '../../store';

const uploadTTSByArrayBuffers =
  (s: FileStore) => async (messageId: string, arrayBuffers: ArrayBuffer[]) => {
    const fileType = 'audio/mp3';
    const blob = new Blob(arrayBuffers, { type: fileType });
    const fileName = `${messageId}.mp3`;
    const fileOptions = {
      lastModified: Date.now(),
      type: fileType,
    };
    const file = new File([blob], fileName, fileOptions);
    const id = await s.uploadTTSFile(file);
    return id;
  };

export const ttsFilesSelectors = {
  uploadTTSByArrayBuffers,
};
