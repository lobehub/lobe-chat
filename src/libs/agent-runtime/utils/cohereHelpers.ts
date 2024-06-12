import { parseDataUri } from './uriParser';
import { OpenAIChatMessage, UserMessageContentPart } from '../types';
import OpenAI from 'openai';

export const buildCohereBlock = (
  content: UserMessageContentPart,
): { content?: string; data?: string; mime_type?: string; type: string } => {
  switch (content.type) {
    case 'text': {
      return { content: content.text, type: 'text' };
    }

    case 'image_url': {
      const { mimeType, base64 } = parseDataUri(content.image_url.url);
      return {
        data: base64 ?? undefined,
        mime_type: mimeType ?? undefined,
        type: 'image'
      };
    }

    default: {
      throw new Error(`Unsupported content type: ${(content as any).type}`);
    }
  }
};

export const buildCohereMessage = (
  message: OpenAIChatMessage,
): { content: string | object; role: string } => {
  const content = message.content as string | UserMessageContentPart[];

  switch (message.role) {
    case 'system':
    case 'user':
    case 'assistant': {
      return {
        content: typeof content === 'string' ? content : content.map(part => buildCohereBlock(part)),
        role: message.role,
      };
    }

    default: {
      throw new Error(`Unsupported message role: ${message.role}`);
    }
  }
};

export const buildCohereMessages = (
  oaiMessages: OpenAIChatMessage[],
): { content: string | object; role: string }[] => {
  return oaiMessages.map(message => buildCohereMessage(message));
};

export function buildCohereTools(tools: any[]): any[] | undefined {
  if (!tools) return undefined;

  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description ?? '',
    parameterDefinitions: tool.input_schema ?? {},
  }));
}
