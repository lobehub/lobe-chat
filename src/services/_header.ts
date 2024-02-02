import { SignJWT, importJWK } from 'jose';

import {
  AZURE_OPENAI_API_VERSION,
  JWTPayload,
  JWT_SECRET_KEY,
  LOBE_CHAT_ACCESS_CODE,
  OPENAI_API_KEY_HEADER_KEY,
  OPENAI_PROXY_URL,
  USE_AZURE_OPENAI,
} from '@/const/fetch';
import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors, settingsSelectors } from '@/store/global/selectors';

const createJWT = async (payload: JWTPayload) => {
  // 将AccessCode转换成适合作为密钥的格式，例如使用SHA-256进行哈希
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.digest('SHA-256', encoder.encode(JWT_SECRET_KEY));

  // 将密钥导入为JWK格式
  const jwkSecretKey = await importJWK(
    {
      k: Buffer.from(secretKey).toString('base64'),
      kty: 'oct',
    },
    'HS256',
  );

  // 获取当前时间戳
  const now = Math.floor(Date.now() / 1000);

  // 创建JWT
  return new SignJWT(payload as Record<string, any>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now) // 设置JWT的iat（签发时间）声明
    .setExpirationTime(now + 100) // 设置 JWT 的 exp（过期时间）为 100 s
    .sign(jwkSecretKey);
};

const getTokenByProvider = (provider: string) => {
  switch (provider) {
    case ModelProvider.ZhiPu: {
      return { apiKey: modelProviderSelectors.zhipuAPIKey(useGlobalStore.getState()) };
    }

    case ModelProvider.Google: {
      return { apiKey: modelProviderSelectors.googleAPIKey(useGlobalStore.getState()) };
    }

    case ModelProvider.Bedrock: {
      const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } =
        modelProviderSelectors.bedrockConfig(useGlobalStore.getState());
      const awsSecretAccessKey = AWS_SECRET_ACCESS_KEY;
      const awsAccessKeyId = AWS_ACCESS_KEY_ID;

      const apiKey = (awsSecretAccessKey || '') + (awsAccessKeyId || '');

      return { apiKey, awsAccessKeyId, awsRegion: AWS_REGION, awsSecretAccessKey };
    }

    default:
    case ModelProvider.OpenAI: {
      const openai = modelProviderSelectors.openAIConfig(useGlobalStore.getState());
      const apiKey = openai.OPENAI_API_KEY || '';
      const endpoint = openai.endpoint || '';

      return {
        apiKey,
        azureApiVersion: openai.azureApiVersion,
        endpoint,
        useAzure: openai.useAzure,
      };
    }
  }
};

export const createBearAuthPayload = async (provider: string) => {
  const accessCode = settingsSelectors.password(useGlobalStore.getState());
  const payload = getTokenByProvider(provider);

  return await createJWT({ accessCode, ...payload });
};

// eslint-disable-next-line no-undef
export const createHeaderWithOpenAI = (header?: HeadersInit): HeadersInit => {
  const openai = modelProviderSelectors.openAIConfig(useGlobalStore.getState());

  const apiKey = openai.OPENAI_API_KEY || '';
  const endpoint = openai.endpoint || '';

  // eslint-disable-next-line no-undef
  const result: HeadersInit = {
    ...header,
    [LOBE_CHAT_ACCESS_CODE]: settingsSelectors.password(useGlobalStore.getState()),
    [OPENAI_API_KEY_HEADER_KEY]: apiKey,
    [OPENAI_PROXY_URL]: endpoint,
  };

  if (openai.useAzure) {
    Object.assign(result, {
      [AZURE_OPENAI_API_VERSION]: openai.azureApiVersion || '',
      [USE_AZURE_OPENAI]: '1',
    });
  }

  return result;
};
