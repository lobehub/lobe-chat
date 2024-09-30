import { DEFAULT_SYSTEM_AGENT_CONFIG } from '@/const/settings';
import { SYSTEM_EMBEDDING_CONFIG } from '@/const/settings/knowledge';
import { SystemEmbeddingConfig } from '@/types/knowledgeBase';
import { UserSystemAgentConfig } from '@/types/user/settings';

const protectedKeys = Object.keys({ ...DEFAULT_SYSTEM_AGENT_CONFIG, ...SYSTEM_EMBEDDING_CONFIG });

export interface CommonSystemConfig extends UserSystemAgentConfig, SystemEmbeddingConfig {}

export const parseSystemAgent = (envString: string = ''): Partial<CommonSystemConfig> => {
  if (!envString) return {};

  const config: Partial<CommonSystemConfig> = {};

  // 处理全角逗号和多余空格
  let envValue = envString.replaceAll('，', ',').trim();

  const pairs = envValue.split(',');

  for (const pair of pairs) {
    const [key, value] = pair.split('=').map((s) => s.trim());

    if (key && value) {
      const [provider, ...modelParts] = value.split('/');
      const model = modelParts.join('/');

      if (!provider) {
        throw new Error('Missing model or provider value');
      }

      if (protectedKeys.includes(key)) {
        config[key as keyof UserSystemAgentConfig] = {
          model: model.trim(),
          provider: provider.trim(),
        };
      }
    } else {
      throw new Error('Invalid environment variable format');
    }
  }

  return config;
};
