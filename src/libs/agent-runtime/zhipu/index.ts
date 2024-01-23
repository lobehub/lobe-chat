import OpenAI from 'openai';

import { ChatStreamPayload } from '@/types/openai/chat';

import { LobeRuntimeAI } from '../BaseAI';
import { createChatCompletion } from './chat';
import { createZhipu } from './createZhipu';

export class LobeZhipuAI implements LobeRuntimeAI {
  private _llm: OpenAI;

  baseURL: string;

  constructor(oai: OpenAI) {
    this._llm = oai;
    this.baseURL = this._llm.baseURL;
  }

  static async fromRequest(req: Request) {
    const llm = await createZhipu(req);
    return new LobeZhipuAI(llm);
  }

  async chat(payload: ChatStreamPayload) {
    return createChatCompletion({ chatModel: this._llm, payload });
  }
}

export default LobeZhipuAI;
