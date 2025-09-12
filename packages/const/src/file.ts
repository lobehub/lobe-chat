export const FILE_UPLOAD_BLACKLIST = [
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
  '.localized',
  'ehthumbs.db',
  'ehthumbs_vista.db',
];

// Audio MIME types and supported formats
export const AUDIO_MIME_TYPES = {
  'audio/mp3': ['.mp3'],
  'audio/mpeg': ['.mp3', '.mpeg'],
  'audio/wav': ['.wav'],
  'audio/mp4': ['.m4a', '.mp4'],
  'audio/webm': ['.webm'],
  'audio/ogg': ['.ogg'],
  'audio/flac': ['.flac'],
  'audio/aac': ['.aac'],
} as const;

export const SUPPORTED_AUDIO_EXTENSIONS = Object.values(AUDIO_MIME_TYPES).flat();

export const SUPPORTED_AUDIO_MIME_TYPES = Object.keys(AUDIO_MIME_TYPES);

// Function to get MIME type from file extension
export const getAudioMimeType = (filename: string): string | undefined => {
  const ext = filename.toLowerCase().split('.').pop();
  if (!ext) return undefined;
  
  const extWithDot = `.${ext}`;
  return Object.entries(AUDIO_MIME_TYPES).find(([_, extensions]) =>
    extensions.includes(extWithDot as any)
  )?.[0];
};

// Function to check if a MIME type is audio
export const isAudioMimeType = (mimeType: string): boolean => {
  return mimeType.startsWith('audio/') || SUPPORTED_AUDIO_MIME_TYPES.includes(mimeType);
};