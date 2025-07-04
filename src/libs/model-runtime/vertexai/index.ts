import { VertexAI, VertexInit } from '@google-cloud/vertexai';

import { AgentRuntimeErrorType } from '../error';
import { LobeGoogleAI } from '../google';
import { AgentRuntimeError } from '../utils/createError';

export class LobeVertexAI extends LobeGoogleAI {
  static initFromVertexAI(params?: VertexInit) {
    try {
      const client = new VertexAI({ ...params });

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
