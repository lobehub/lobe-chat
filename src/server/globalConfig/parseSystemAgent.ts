import { DEFAULT_SYSTEM_AGENT_CONFIG } from '@/const/settings';
import { UserSystemAgentConfig } from '@/types/user/settings';

const protectedKeys = Object.keys(DEFAULT_SYSTEM_AGENT_CONFIG);

export const parseSystemAgent = (envString: string = ''): Partial<UserSystemAgentConfig> => {
  if (!envString) return {};

  const config: Partial<UserSystemAgentConfig> = {};

  // 处理全角逗号和多余空格
  let envValue = envString.replaceAll('，', ',').trim();

  const pairs = envValue.split(',');

  for (const pair of pairs) {
    const [key, value] = pair.split('=').map((s) => s.trim());

    if (key && value) {
      const [provider, ...modelParts] = value.split('/');
      const model = modelParts.join('/');

      if (!provider || !model) {
        throw new Error('Missing model or provider value');
      }

      if (protectedKeys.includes(key)) {
        config[key as keyof UserSystemAgentConfig] = {
          enabled: key === 'queryRewrite' ? true : undefined,
          model: model.trim(),
          provider: provider.trim(),
        } as any;
      }
    } else {
      throw new Error('Invalid environment variable format');
    }
  }

  return config;
};
