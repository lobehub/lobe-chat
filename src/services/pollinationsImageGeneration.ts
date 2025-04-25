import { DallEImageItem } from '@/types/tool/dalle';

interface FetchOptions {
  signal?: AbortSignal | undefined;
}

class PollinationsImageGenerationService {
  generateImage = async (
    params: Omit<DallEImageItem, 'imageId' | 'previewUrl'>,
    options?: FetchOptions,
  ) => {
    // Construct the Pollinations.AI API URL with the prompt
    const encodedPrompt = encodeURIComponent(params.prompt);
    const size = params.size.replace('x', '/'); // Convert 1024x1024 to 1024/1024 format
    
    // Use Pollinations.AI API
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${size.split('/')[0]}&height=${size.split('/')[1]}&nologo=true`;
    
    // Return the URL directly - Pollinations.AI generates the image on-demand via URL
    return pollinationsUrl;
  };
}

export const pollinationsImageGenerationService = new PollinationsImageGenerationService();
