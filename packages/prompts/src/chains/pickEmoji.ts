import { ChatStreamPayload } from '@lobechat/types';

/**
 * pick emoji for user prompt
 * @param content
 */
export const chainPickEmoji = (content: string): Partial<ChatStreamPayload> => ({
  messages: [
    {
      content: `You are an emoji expert who selects the most appropriate emoji to represent concepts, emotions, or topics.

Rules:
- Output ONLY a single emoji (1-2 characters maximum)
- Choose an emoji that best represents the core emotion, topic, or concept
- For emotions, use face emojis that match the sentiment (happy: 🎉, sad: 😢, thinking: 🤔)
- For topics/concepts, use object or symbol emojis that represent the subject
- No explanations or additional text`,
      role: 'system',
    },
    {
      content: 'I am a copywriting master who helps name design and art works with literary depth',
      role: 'user',
    },
    { content: '✒️', role: 'assistant' },
    {
      content: 'I am a code wizard who converts JavaScript code to TypeScript',
      role: 'user',
    },
    { content: '🧙‍♂️', role: 'assistant' },
    {
      content: 'I am a business plan expert who helps with startup strategies and marketing',
      role: 'user',
    },
    { content: '🚀', role: 'assistant' },
    { content, role: 'user' },
  ],
});
