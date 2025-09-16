import { LobeAnthropicAI } from '../../providers/anthropic';
import { LobeAzureAI } from '../../providers/azureai';
import { LobeCloudflareAI } from '../../providers/cloudflare';
import { LobeFalAI } from '../../providers/fal';
import { LobeGoogleAI } from '../../providers/google';
import { LobeOpenAI } from '../../providers/openai';
import { LobeQwenAI } from '../../providers/qwen';
import { LobeXAI } from '../../providers/xai';

export const baseRuntimeMap = {
  anthropic: LobeAnthropicAI,
  azure: LobeAzureAI,
  cloudflare: LobeCloudflareAI,
  fal: LobeFalAI,
  google: LobeGoogleAI,
  openai: LobeOpenAI,
  qwen: LobeQwenAI,
  xai: LobeXAI,
};
