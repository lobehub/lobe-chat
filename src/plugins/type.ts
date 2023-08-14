import { ChatCompletionFunctions } from 'openai-edge/types/api';
import { ReactNode } from 'react';

/**
 * 插件项
 * @template Result - 结果类型，默认为 any
 * @template RunnerParams - 运行参数类型，默认为 any
 */
export interface PluginItem<Result = any, RunnerParams = any> {
  /**
   * 头像
   */
  avatar: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 运行器
   * @param params - 运行参数
   * @returns 运行结果的 Promise
   */
  runner: PluginRunner<RunnerParams, Result>;
  /**
   * 聊天完成函数的模式
   */
  schema: ChatCompletionFunctions;
}

/**
 * 插件渲染函数
 * @param props - 插件渲染属性
 * @returns React 节点
 */
export type PluginRender = (props: PluginRenderProps) => ReactNode;

/**
 * 插件运行器
 * @template Params - 参数类型，默认为 object
 * @template Result - 结果类型，默认为 any
 * @param params - 运行参数
 * @returns 运行结果的 Promise
 */
export type PluginRunner<Params = object, Result = any> = (params: Params) => Promise<Result>;

/**
 * 插件渲染属性
 * @template Result - 结果类型，默认为 any
 */
export interface PluginRenderProps<Result = any> {
  /**
   * 内容
   */
  content: Result;
  /**
   * 名称
   */
  name: string;
}
