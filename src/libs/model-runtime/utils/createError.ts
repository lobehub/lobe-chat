import { ILobeAgentRuntimeErrorType } from '../error';
import {
  AgentInitErrorPayload,
  ChatCompletionErrorPayload,
  CreateImageErrorPayload,
} from '../types';

export const AgentRuntimeError = {
  chat: (error: ChatCompletionErrorPayload): ChatCompletionErrorPayload => error,
  createError: (
    errorType: ILobeAgentRuntimeErrorType | string | number,
    error?: any,
  ): AgentInitErrorPayload => ({ error, errorType }),
  createImage: (error: CreateImageErrorPayload): CreateImageErrorPayload => error,
  textToImage: (error: any): any => error,
};
