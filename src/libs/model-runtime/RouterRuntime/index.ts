import { LobeRuntimeAI } from '../BaseAI';

export interface RuntimeItem {
  id: string;
  models?: string[];
  runtime: LobeRuntimeAI;
}

export { createRouterRuntime } from './createRuntime';
