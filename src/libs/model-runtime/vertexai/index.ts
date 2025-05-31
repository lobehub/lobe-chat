import { GoogleGenAI, GoogleGenAIOptions } from '@google/genai';

import { AgentRuntimeErrorType } from '../error';
import { LobeGoogleAI } from '../google';
import { AgentRuntimeError } from '../utils/createError';

const DEFAULT_VERTEXAI_LOCATION = 'us-central1';

export class LobeVertexAI extends LobeGoogleAI {
  static initFromVertexAI(params?: GoogleGenAIOptions) {
    try {
      // 使用 Vertex AI 时，需要把环境变量 GOOGLE_API_KEY 删除，
      // 或者设置一个值，不能是空字符串。`GOOGLE_API_KEY=` 这样会导致 GoogleGenAI 内 apiKey 设置不正确
      const client = new GoogleGenAI({
        ...params,
        location: params?.location ?? DEFAULT_VERTEXAI_LOCATION, // @google/genai 不传 location 会报错
        vertexai: true,
      });

      return new LobeGoogleAI({ apiKey: 'avoid-error', client, isVertexAi: true });
    } catch (e) {
      const err = e as Error;

      if (err.name === 'IllegalArgumentError') {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidVertexCredentials, {
          message: err.message,
        });
      }

      throw e;
    }
  }
}
