import { ChatCompletionFunctions } from 'openai-edge/types/api';
import { ReactNode } from 'react';

export interface PluginItem<Result = any, RunnerParams = any> {
  avatar: string;
  name: string;
  runner: PluginRunner<RunnerParams, Result>;
  schema: ChatCompletionFunctions;
}
export type PluginRender = (props: PluginRenderProps) => ReactNode;

export type PluginRunner<Params = object, Result = any> = (params: Params) => Promise<Result>;

export interface PluginRenderProps<Result = any> {
  content: Result;
  name: string;
}
