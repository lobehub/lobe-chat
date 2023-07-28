import { ChatCompletionFunctions } from 'openai-edge/types/api';
import { ReactNode } from 'react';

export interface PluginItem<Result = any, RunnerParams = any> {
  avatar: string;
  name: string;
  render?: (props: PluginRenderProps) => ReactNode;
  runner: PluginRunner<RunnerParams, Result>;
  schema: ChatCompletionFunctions;
}

export type PluginRunner<Params = object, Result = any> = (params: Params) => Promise<Result>;

export interface PluginRenderProps<Result = any> {
  content: Result;
  name: string;
}
