import OpenAI from 'openai';
import { SignJWT } from 'jose';

import { ChatStreamPayload, ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

// Function to generate JWT token
const generateJwtTokenSenseNova = async (
  accessKeyID: string = '',
  accessKeySecret: string = '',
  expiredAfter: number = 1800,
  notBefore: number = 5
) => {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + expiredAfter,
    iss: accessKeyID,
    nbf: Math.floor(Date.now() / 1000) - notBefore,
  };

  // Create the JWT using the jose library
  const apiKey = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(new TextEncoder().encode(accessKeySecret));

  return apiKey;
};

// LobeSenseNovaAI setup
export const LobeSenseNovaAI = (() => {
  // Create the factory instance using LobeOpenAICompatibleFactory
  const factory = LobeOpenAICompatibleFactory({
    baseURL: 'https://api.sensenova.cn/compatible-mode/v1',
    chatCompletion: {
      handlePayload: (payload: ChatStreamPayload) => {
        const { frequency_penalty, temperature, top_p, ...rest } = payload;

        return {
          ...rest,
          frequency_penalty: (frequency_penalty !== undefined && frequency_penalty > 0 && frequency_penalty <= 2) ? frequency_penalty : undefined,
          temperature: (temperature !== undefined && temperature > 0 && temperature <= 2) ? temperature : undefined,
          top_p: (top_p !== undefined && top_p > 0 && top_p < 1) ? top_p : undefined,
        } as OpenAI.ChatCompletionCreateParamsStreaming;
      },
    },
    debug: {
      chatCompletion: () => process.env.DEBUG_SENSENOVA_CHAT_COMPLETION === '1',
    },
    provider: ModelProvider.SenseNova,
  });

  // Use Object.assign to add the generateJWTToken method
  return Object.assign(factory, {
    generateJWTToken: async (ak: string, sk: string, expiredAfter: number = 1800, notBefore: number = 5) => {
      return await generateJwtTokenSenseNova(ak, sk, expiredAfter, notBefore);
    },
  });
})();
