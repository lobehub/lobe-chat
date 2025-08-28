import { Content, GoogleGenAI, Part } from '@google/genai';
import { imageUrlToBase64 } from '@lobechat/utils';

import { CreateImagePayload, CreateImageResponse } from '../types/image';
import { AgentRuntimeError } from '../utils/createError';
import { parseGoogleErrorMessage } from '../utils/googleErrorParser';
import { parseDataUri } from '../utils/uriParser';

/**
 * Extract image data from generateContent response
 */
function extractImageFromResponse(response: any): CreateImageResponse {
  const candidate = response.candidates?.[0];
  if (!candidate?.content?.parts) {
    throw new Error('No image generated');
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData?.data) {
      const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      return { imageUrl };
    }
  }

  throw new Error('No image data found in response');
}

/**
 * Generate images using traditional Imagen models with generateImages API
 */
async function generateByImageModel(
  client: GoogleGenAI,
  payload: CreateImagePayload,
): Promise<CreateImageResponse> {
  const { model, params } = payload;

  const response = await client.models.generateImages({
    config: {
      aspectRatio: params.aspectRatio,
      numberOfImages: 1,
    },
    model,
    prompt: params.prompt,
  });

  if (!response.generatedImages || response.generatedImages.length === 0) {
    throw new Error('No images generated');
  }

  const generatedImage = response.generatedImages[0];
  if (!generatedImage.image || !generatedImage.image.imageBytes) {
    throw new Error('Invalid image data');
  }

  const { imageBytes } = generatedImage.image;
  // 1. official doc use png as example
  // 2. no responseType param support like openai now.
  // I think we can just hard code png now
  const imageUrl = `data:image/png;base64,${imageBytes}`;

  return { imageUrl };
}

/**
 * Generate images using Gemini Chat Models with generateContent
 */
async function generateImageByChatModel(
  client: GoogleGenAI,
  payload: CreateImagePayload,
): Promise<CreateImageResponse> {
  const { model, params } = payload;
  const actualModel = model.replace(':image', '');

  // Build content parts
  const parts: Part[] = [{ text: params.prompt }];

  // Add image for editing if provided
  if (params.imageUrl && params.imageUrl !== null) {
    const { mimeType, base64, type } = parseDataUri(params.imageUrl);

    if (type === 'base64') {
      if (!base64) {
        throw new TypeError("Image URL doesn't contain base64 data");
      }

      parts.push({
        inlineData: {
          data: base64,
          mimeType: mimeType || 'image/png',
        },
      });
    } else if (type === 'url') {
      const { base64: urlBase64, mimeType: urlMimeType } = await imageUrlToBase64(params.imageUrl);

      parts.push({
        inlineData: {
          data: urlBase64,
          mimeType: urlMimeType,
        },
      });
    } else {
      throw new TypeError(`currently we don't support image url: ${params.imageUrl}`);
    }
  }

  const contents: Content[] = [
    {
      parts,
      role: 'user',
    },
  ];

  const response = await client.models.generateContent({
    config: {
      responseModalities: ['Image'],
    },
    contents,
    model: actualModel,
  });

  return extractImageFromResponse(response);
}

/**
 * Create image using Google AI models
 */
export async function createGoogleImage(
  client: GoogleGenAI,
  provider: string,
  payload: CreateImagePayload,
): Promise<CreateImageResponse> {
  try {
    const { model } = payload;

    // Handle Gemini 2.5 Flash Image models that use generateContent
    if (model.endsWith(':image')) {
      return await generateImageByChatModel(client, payload);
    }

    // Handle traditional Imagen models that use generateImages
    return await generateByImageModel(client, payload);
  } catch (error) {
    const err = error as Error;

    const { errorType, error: parsedError } = parseGoogleErrorMessage(err.message);
    throw AgentRuntimeError.createImage({
      error: parsedError,
      errorType,
      provider,
    });
  }
}
