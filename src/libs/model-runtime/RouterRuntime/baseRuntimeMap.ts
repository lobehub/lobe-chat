import { LobeAnthropicAI } from '../anthropic';
import { LobeAzureAI } from '../azureai';
import { LobeCloudflareAI } from '../cloudflare';
import { LobeFalAI } from '../fal';
import { LobeGoogleAI } from '../google';
import { LobeOpenAI } from '../openai';

export const baseRuntimeMap = {
  anthropic: LobeAnthropicAI,
  azure: LobeAzureAI,
  cloudflare: LobeCloudflareAI,
  fal: LobeFalAI,
  google: LobeGoogleAI,
  openai: LobeOpenAI,
};
