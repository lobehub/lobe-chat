import { isDesktop } from '@/const/version';
import { appEnv, getAppConfig } from '@/envs/app';
import { authEnv } from '@/envs/auth';
import { fileEnv } from '@/envs/file';
import { imageEnv } from '@/envs/image';
import { knowledgeEnv } from '@/envs/knowledge';
import { langfuseEnv } from '@/envs/langfuse';
import { parseSystemAgent } from '@/server/globalConfig/parseSystemAgent';
import { GlobalServerConfig } from '@/types/serverConfig';
import { cleanObject } from '@/utils/object';

import { genServerAiProvidersConfig } from './genServerAiProviderConfig';
import { parseAgentConfig } from './parseDefaultAgent';
import { parseFilesConfig } from './parseFilesConfig';

export const getServerGlobalConfig = async () => {
  const { ACCESS_CODES, DEFAULT_AGENT_CONFIG } = getAppConfig();

  const config: GlobalServerConfig = {
    aiProvider: await genServerAiProvidersConfig({
      azure: {
        enabledKey: 'ENABLED_AZURE_OPENAI',
        withDeploymentName: true,
      },
      bedrock: {
        enabledKey: 'ENABLED_AWS_BEDROCK',
        modelListKey: 'AWS_BEDROCK_MODEL_LIST',
      },
      giteeai: {
        enabledKey: 'ENABLED_GITEE_AI',
        modelListKey: 'GITEE_AI_MODEL_LIST',
      },
      lmstudio: {
        fetchOnClient: isDesktop ? false : undefined,
      },
      /* ↓ cloud slot ↓ */

      /* ↑ cloud slot ↑ */
      ollama: {
        enabled: isDesktop ? true : undefined,
        fetchOnClient: isDesktop ? false : !process.env.OLLAMA_PROXY_URL,
      },
      ollamacloud: {
        enabledKey: 'ENABLED_OLLAMA_CLOUD',
      },
      qwen: {
        withDeploymentName: true,
      },
      tencentcloud: {
        enabledKey: 'ENABLED_TENCENT_CLOUD',
        modelListKey: 'TENCENT_CLOUD_MODEL_LIST',
      },
      volcengine: {
        withDeploymentName: true,
      },
    }),
    defaultAgent: {
      config: parseAgentConfig(DEFAULT_AGENT_CONFIG),
    },
    enableUploadFileToServer: !!fileEnv.S3_SECRET_ACCESS_KEY,
    enabledAccessCode: ACCESS_CODES?.length > 0,

    image: cleanObject({
      defaultImageNum: imageEnv.AI_IMAGE_DEFAULT_IMAGE_NUM,
    }),
    oAuthSSOProviders: authEnv.NEXT_AUTH_SSO_PROVIDERS.trim().split(/[,，]/),
    systemAgent: parseSystemAgent(appEnv.SYSTEM_AGENT),
    telemetry: {
      langfuse: langfuseEnv.ENABLE_LANGFUSE,
    },
  };

  return config;
};

export const getServerDefaultAgentConfig = () => {
  const { DEFAULT_AGENT_CONFIG } = getAppConfig();

  return parseAgentConfig(DEFAULT_AGENT_CONFIG) || {};
};

export const getServerDefaultFilesConfig = () => {
  return parseFilesConfig(knowledgeEnv.DEFAULT_FILES_CONFIG);
};
