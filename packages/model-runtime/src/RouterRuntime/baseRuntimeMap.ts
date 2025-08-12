import { LobeAnthropicAI } from '../anthropic';
import { LobeAzureAI } from '../azureai';
import { LobeCloudflareAI } from '../cloudflare';
import { LobeFalAI } from '../fal';
import { LobeGoogleAI } from '../google';
import { LobeOpenAI } from '../openai';
import { LobeXAI } from '../xai';

export const baseRuntimeMap = {
  anthropic: LobeAnthropicAI,
  azure: LobeAzureAI,
  cloudflare: LobeCloudflareAI,
  fal: LobeFalAI,
  google: LobeGoogleAI,
  openai: LobeOpenAI,
  xai: LobeXAI,
};
