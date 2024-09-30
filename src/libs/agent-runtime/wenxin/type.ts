/**
 * token 用量基类
 */
export interface TokenUsage {
  /**
   * 回答tokens数
   */
  completion_tokens?: number;
  /**
   * 问题tokens数
   */
  prompt_tokens: number;
  /**
   * tokens总数
   */
  total_tokens: number;
}

/**
 * 响应基类
 */
export interface RespBase {
  /**
   * 时间戳
   */
  created: number;
  /**
   * 本轮对话的id
   */
  id: string;
  /**
   * 表示当前子句是否是最后一句。只有在流式接口模式下会返回该字段
   */
  is_end?: boolean;
  /**
   * 1：表示输入内容无安全风险
   * 0：表示输入内容有安全风险
   */
  is_safe?: number;
  /**
   * 回包类型。
   *
   * chat.completion：多轮对话返回
   */
  object: string;
  /**
   * 对话返回结果
   */
  result: string;
  /**
   * 表示当前子句的序号。只有在流式接口模式下会返回该字段
   */
  sentence_id?: number;
  /**
   * token统计信息，token数 = 汉字数+单词数*1.3 （仅为估算逻辑）
   */
  usage: TokenUsage;
}

export interface ChatResp extends RespBase {
  /**
   * 当 need_clear_history 为 true 时，此字段会告知第几轮对话有敏感信息，如果是当前问题，ban_round=-1
   */
  ban_round: number;
  /**
   * 输出内容标识，说明：
   * · normal：输出内容完全由大模型生成，未触发截断、替换
   * · stop：输出结果命中入参stop中指定的字段后被截断
   * · length：达到了最大的token数，根据EB返回结果is_truncated来截断
   * · content_filter：输出内容被截断、兜底、替换为**等
   */
  finish_reason: string;
  /**
   * 当前生成的结果是否被截断
   */
  is_truncated?: boolean;
  /**
   * 表示用户输入是否存在安全，是否关闭当前会话，清理历史会话信息
   *
   * true：是，表示用户输入存在安全风险，建议关闭当前会话，清理历史会话信息
   * false：否，表示用户输入无安全风险
   */
  need_clear_history: boolean;
}
