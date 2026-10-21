import type { AutoRoutingDifficulty, AutoRoutingSignals } from './types';

const HARD_HINTS = [
  /\b(prove|proof|derive|architect(ure)?|refactor|optimi[sz]e|algorithm|debug|trade-?offs?)\b/i,
  /(证明|推导|架构|重构|优化|算法|调试|排查|权衡|方案设计|系统设计)/,
];
const SIMPLE_HINTS = [
  /^(hi|hello|hey|thanks|thank you|ok|okay)\b/i,
  /^(你好|您好|谢谢|好的|嗯|收到)/,
  /\b(translate|rephrase|summari[sz]e)\b/i,
  /(翻译|改写|润色|总结一下)/,
];

export interface HeuristicInput {
  attachmentCount?: number;
  prompt: string;
}

/**
 * Rule-based difficulty used when no judge model is configured or the judge
 * call fails. It only needs to be roughly right: the routing table and the
 * cache-aware switching rules do the rest.
 */
export const estimateDifficulty = ({
  attachmentCount = 0,
  prompt,
}: HeuristicInput): AutoRoutingSignals => {
  const text = prompt.trim();
  const codeBlocks = (text.match(/```/g)?.length ?? 0) / 2;
  const hardHits = HARD_HINTS.filter((pattern) => pattern.test(text)).length;

  let difficulty: AutoRoutingDifficulty = 1;
  if (text.length > 2000 || codeBlocks >= 2 || (hardHits > 0 && text.length > 200)) difficulty = 2;
  else if (
    text.length < 120 &&
    codeBlocks === 0 &&
    hardHits === 0 &&
    attachmentCount === 0 &&
    (text.length < 40 || SIMPLE_HINTS.some((pattern) => pattern.test(text)))
  )
    difficulty = 0;

  return { difficulty, source: 'heuristic' };
};
