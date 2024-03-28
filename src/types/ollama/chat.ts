import { OpenAIChatMessage } from '../openai/chat';

export interface OllamaChatMessage extends OpenAIChatMessage {
  /**
   * @description images for ollama vision models (https://ollama.com/blog/vision-models)
   */
  images?: string[];
}
