import { GoogleGenAI, type GoogleGenAIOptions } from '@google/genai';

import { AgentRuntimeErrorType } from '../error';
import { LobeGoogleAI } from '../google';
import { AgentRuntimeError } from '../utils/createError';

export class LobeVertexAI extends LobeGoogleAI {
  static initFromVertexAI(params?: GoogleGenAIOptions) {
    try {
      const client = new GoogleGenAI({ ...params });

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
