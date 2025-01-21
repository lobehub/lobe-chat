import { appEnv, getAppConfig } from '@/config/app';
import { authEnv } from '@/config/auth';
import { fileEnv } from '@/config/file';
import { knowledgeEnv } from '@/config/knowledge';
import { langfuseEnv } from '@/config/langfuse';
import { enableNextAuth } from '@/const/auth';
import { parseSystemAgent } from '@/server/globalConfig/parseSystemAgent';
import { GlobalServerConfig } from '@/types/serverConfig';

import { genServerLLMConfig } from './_deprecated';
import { genServerAiProvidersConfig } from './genServerAiProviderConfig';
import { parseAgentConfig } from './parseDefaultAgent';
import { parseFilesConfig } from './parseFilesConfig';

export const getServerGlobalConfig = () => {
  const { ACCESS_CODES, DEFAULT_AGENT_CONFIG } = getAppConfig();

  const config: GlobalServerConfig = {
    aiProvider: genServerAiProvidersConfig({
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
      ollama: {
        fetchOnClient: !process.env.OLLAMA_PROXY_URL,
      },
    }),
    defaultAgent: {
      config: parseAgentConfig(DEFAULT_AGENT_CONFIG),
    },
    enableUploadFileToServer: !!fileEnv.S3_SECRET_ACCESS_KEY,
    enabledAccessCode: ACCESS_CODES?.length > 0,

    enabledOAuthSSO: enableNextAuth,
    /**
     * @deprecated
     */
    languageModel: genServerLLMConfig({
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
      ollama: {
        fetchOnClient: !process.env.OLLAMA_PROXY_URL,
      },
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
