import { SignJWT, importJWK } from 'jose';

import { JWTPayload, JWT_SECRET_KEY, LOBE_CHAT_AUTH_HEADER } from '@/const/auth';
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

const getProviderAuthPayload = (provider: string) => {
  switch (provider) {
    case ModelProvider.ZhiPu: {
      return { apiKey: modelProviderSelectors.zhipuAPIKey(useGlobalStore.getState()) };
    }

    case ModelProvider.Google: {
      return { apiKey: modelProviderSelectors.googleAPIKey(useGlobalStore.getState()) };
    }

    case ModelProvider.Bedrock: {
      const { accessKeyId, region, secretAccessKey } = modelProviderSelectors.bedrockConfig(
        useGlobalStore.getState(),
      );
      const awsSecretAccessKey = secretAccessKey;
      const awsAccessKeyId = accessKeyId;

      const apiKey = (awsSecretAccessKey || '') + (awsAccessKeyId || '');

      return { apiKey, awsAccessKeyId, awsRegion: region, awsSecretAccessKey };
    }

    case ModelProvider.Azure: {
      const azure = modelProviderSelectors.azureConfig(useGlobalStore.getState());

      return {
        apiKey: azure.apiKey,
        azureApiVersion: azure.apiVersion,
        endpoint: azure.endpoint,
      };
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

const createAuthTokenWithPayload = async (payload = {}) => {
  const accessCode = settingsSelectors.password(useGlobalStore.getState());

  return await createJWT({ accessCode, ...payload });
};

interface AuthParams {
  // eslint-disable-next-line no-undef
  headers?: HeadersInit;
  payload?: Record<string, any>;
  provider?: string;
}

// eslint-disable-next-line no-undef
export const createHeaderWithAuth = async (params?: AuthParams): Promise<HeadersInit> => {
  let payload = params?.payload || {};

  if (params?.provider) {
    payload = { ...payload, ...getProviderAuthPayload(params?.provider) };
  }

  const token = await createAuthTokenWithPayload(payload);

  // eslint-disable-next-line no-undef
  return { ...params?.headers, [LOBE_CHAT_AUTH_HEADER]: token };
};
