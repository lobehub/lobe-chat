export type SearchMode = 'off' | 'auto' | 'on';

export enum ModelSearchImplement {
  /**
   * 模型内置了搜索功能
   * 类似 Jina 、PPLX 等模型的搜索模式，让调用方无感知
   */
  Internal = 'internal',
  /**
   * 使用参数开关的方式
   */
  Params = 'params',
  /**
   * 使用工具调用的方式
   */
  Tool = 'tool',
}
