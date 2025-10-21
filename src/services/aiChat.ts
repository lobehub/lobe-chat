import { ContextEngine, MessageCleanupProcessor } from '@lobechat/context-engine';
import { autoSuggestionPrompt } from '@lobechat/prompts';
import { SendMessageServerParams, StructureOutputParams } from '@lobechat/types';
import { cleanObject } from '@lobechat/utils';

import { lambdaClient } from '@/libs/trpc/client';
import { createXorKeyVaultsPayload } from '@/services/_auth';
import { useUserStore } from '@/store/user';
import { systemAgentSelectors } from '@/store/user/slices/settings/selectors';
import { ChatMessage } from '@/types/message';

const SuggestionsSchema = {
  description: 'Auto-generated suggestions for chat messages',
  name: 'suggestions',
  schema: {
    additionalProperties: false,
    properties: {
      suggestions: {
        items: { type: 'string' },
        maxItems: 3,
        type: 'array',
      },
    },
    required: ['suggestions'],
    type: 'object' as const,
  },
  strict: true,
};

interface GenerateSuggestionParams {
  maxSuggestions?: number;
  messages: ChatMessage[];
  systemRole?: string;
}

class AiChatService {
  sendMessageInServer = async (
    params: SendMessageServerParams,
    abortController: AbortController,
  ) => {
    return lambdaClient.aiChat.sendMessageInServer.mutate(cleanObject(params), {
      context: { showNotification: false },
      signal: abortController?.signal,
    });
  };

  generateJSON = async (
    params: Omit<StructureOutputParams, 'keyVaultsPayload'>,
    abortController: AbortController,
  ) => {
    return lambdaClient.aiChat.outputJSON.mutate(
      { ...params, keyVaultsPayload: createXorKeyVaultsPayload(params.provider) },
      {
        context: { showNotification: false },
        signal: abortController?.signal,
      },
    );
  };

  generateSuggestion = async (
    params: GenerateSuggestionParams,
    abortController: AbortController,
  ): Promise<string[] | undefined> => {
    const { maxSuggestions, messages, systemRole } = params;

    // Get system agent configuration for model and provider
    const userState = useUserStore.getState();
    const systemAgentConfig = systemAgentSelectors.autoSuggestion(userState);
    const { model, provider, customPrompt, enabled } = systemAgentConfig;

    if (enabled === false) return;

    // Build prompt using Prompt Layer
    const prompt = autoSuggestionPrompt({ customPrompt, maxSuggestions, messages, systemRole });

    // Process messages with ContextEngine
    const contextEngine = new ContextEngine({
      pipeline: [new MessageCleanupProcessor()],
    });

    const { messages: processedMessages } = await contextEngine.process({
      initialState: {
        messages: [],
      },
      maxTokens: 1024,
      messages: [
        {
          content: prompt,
          createdAt: Date.now(),
          id: 'temp-suggestion-msg',
          meta: {},
          role: 'user',
          updatedAt: Date.now(),
        } as any,
      ],
      model,
    });

    // Call AI service
    const result = (await this.generateJSON(
      {
        messages: processedMessages,
        model,
        provider,
        schema: SuggestionsSchema,
      },
      abortController,
    )) as { suggestions: string[] };

    // Parse suggestions
    return result.suggestions;
  };

  // sendGroupMessageInServer = async (params: SendMessageServerParams) => {
  //   return lambdaClient.aiChat.sendGroupMessageInServer.mutate(cleanObject(params));
  // };
}

export const aiChatService = new AiChatService();
