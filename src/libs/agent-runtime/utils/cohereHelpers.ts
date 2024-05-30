import { parseDataUri } from './uriParser';
import { OpenAIChatMessage, UserMessageContentPart } from '../types';
import Cohere from 'cohere-ai';

export const buildCohereBlock = (
  content: UserMessageContentPart,
): { type: string; content?: string; data?: string; mime_type?: string } => {
  switch (content.type) {
    case 'text': {
      return { type: 'text', content: content.text };
    }

    case 'image_url': {
      const { mimeType, base64 } = parseDataUri(content.image_url.url);
      return {
        type: 'image',
        data: base64,
        mime_type: mimeType,
      };
    }

    default: {
      throw new Error(`Unsupported content type: ${content.type}`);
    }
  }
};

export const buildCohereMessage = (
  message: OpenAIChatMessage,
): { role: string; content: string | object } => {
  const content = message.content as string | UserMessageContentPart[];

  switch (message.role) {
    case 'system':
    case 'user':
    case 'assistant': {
      return {
        role: message.role,
        content: typeof content === 'string' ? content : content.map(buildCohereBlock),
      };
    }

    default: {
      throw new Error(`Unsupported message role: ${message.role}`);
    }
  }
};

export const buildCohereMessages = (
  oaiMessages: OpenAIChatMessage[],
): { role: string; content: string | object }[] => {
  return oaiMessages.map(buildCohereMessage);
};

export const buildCohereTools = (tools?: OpenAI.ChatCompletionTool[]) =>
  tools?.map(tool => ({
    name: tool.function.name,
    description: tool.function.description,
    input_schema: tool.function.parameters,
  }));
