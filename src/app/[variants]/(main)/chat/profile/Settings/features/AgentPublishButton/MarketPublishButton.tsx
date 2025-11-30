import { ActionIcon, Button } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { LogIn, Share2, Upload } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { message } from '@/components/AntdStaticMethods';
import { HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useStore } from '@/features/AgentSetting/store';
import { checkOwnership } from '@/hooks/useAgentOwnershipCheck';
import { useTokenCount } from '@/hooks/useTokenCount';
import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { resolveMarketAuthError } from '@/layout/AuthProvider/MarketAuth/errors';
import { marketApiService } from '@/services/marketApi';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import PublishResultModal from '../PublishResultModal';
import { type MarketPublishAction } from './MarketPublishModal';
import { generateDefaultChangelog, generateMarketIdentifier } from './utils';

interface MarketPublishButtonProps {
  action: MarketPublishAction;
  marketIdentifier?: string;
  modal?: boolean;
}

const MarketPublishButton = memo<MarketPublishButtonProps>(
  ({ action, marketIdentifier, modal }) => {
    const { t: tSetting } = useTranslation('setting');
    const { t: tMarketAuth } = useTranslation('marketAuth');
    const mobile = useServerConfigStore((s) => s.isMobile);

    const [isPublishing, setIsPublishing] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [publishResult, setPublishResult] = useState<{ identifier?: string }>({});

    const { isAuthenticated, isLoading, session, signIn } = useMarketAuth();

    // Agent data from store
    const meta = useAgentStore(agentSelectors.currentAgentMeta, isEqual);
    const updateSessionMeta = useSessionStore((s) => s.updateSessionMeta);
    const systemRole = useAgentStore(agentSelectors.currentAgentSystemRole);
    const editorData = useStore((s) => s.config.editorData);
    const language = useGlobalStore(globalGeneralSelectors.currentLanguage);
    const agentConfig = useAgentStore(agentSelectors.currentAgentConfig);
    const chatConfig = useAgentStore(agentChatConfigSelectors.currentChatConfig);
    const plugins = useAgentStore(agentSelectors.currentAgentPlugins);
    const model = useAgentStore(agentSelectors.currentAgentModel);
    const provider = useAgentStore(agentSelectors.currentAgentModelProvider);
    const tokenUsage = useTokenCount(systemRole);

    const isSubmit = action === 'submit';

    const buttonCopy = useMemo(() => {
      if (action === 'upload') {
        return {
          authenticated: {
            icon: Upload,
            text: tSetting('marketPublish.upload.button'),
            title: tSetting('marketPublish.upload.tooltip'),
          },
          successMessage: tMarketAuth('messages.success.upload'),
          unauthenticated: {
            icon: LogIn,
            text: tSetting('marketPublish.upload.button'),
            title: tSetting('marketPublish.upload.tooltip'),
          },
        } as const;
      }

      const submitText = tSetting('submitAgentModal.tooltips');

      return {
        authenticated: {
          icon: Share2,
          text: submitText,
          title: submitText,
        },
        successMessage: tMarketAuth('messages.success.submit'),
        unauthenticated: {
          icon: LogIn,
          text: tSetting('marketPublish.submit.button'),
          title: tSetting('marketPublish.submit.tooltip'),
        },
      } as const;
    }, [action, tMarketAuth, tSetting]);

    const handlePublish = useCallback(async () => {
      if (!isAuthenticated || !session?.accessToken) {
        message.error(tSetting('marketPublish.modal.messages.notAuthenticated'));
        return false;
      }

      const messageKey = isSubmit ? 'submit' : 'upload-version';
      const loadingMessage = isSubmit
        ? tSetting('marketPublish.modal.loading.submit')
        : tSetting('marketPublish.modal.loading.upload');

      let identifier = meta?.marketIdentifier;
      const changelog = generateDefaultChangelog();

      try {
        setIsPublishing(true);
        message.loading({ content: loadingMessage, key: messageKey });
        marketApiService.setAccessToken(session.accessToken);

        if (isSubmit) {
          identifier = generateMarketIdentifier();

          try {
            await marketApiService.getAgentDetail(identifier);
          } catch {
            const createPayload: Record<string, unknown> = {
              identifier,
              name: meta?.title || '',
            };
            await marketApiService.createAgent(createPayload as any);
          }
        } else if (!identifier) {
          message.error({
            content: tSetting('marketPublish.modal.messages.missingIdentifier'),
            key: messageKey,
          });
          return false;
        }

        const versionPayload = {
          avatar: meta?.avatar,
          changelog,
          config: {
            chatConfig: {
              displayMode: chatConfig?.displayMode,
              enableHistoryCount: chatConfig?.enableHistoryCount,
              historyCount: chatConfig?.historyCount,
              maxTokens: agentConfig?.params?.max_tokens,
              searchMode: chatConfig?.searchMode,
              temperature: agentConfig?.params?.temperature,
              topP: agentConfig?.params?.top_p,
            },
            description: meta?.description,
            locale: language,
            model: {
              model,
              parameters: agentConfig?.params,
              provider,
            },
            plugins:
              plugins?.map((plugin) => {
                if (typeof plugin === 'string') {
                  return plugin;
                } else {
                  return null;
                }
              }) || [],
            systemRole: systemRole,
          },
          description: meta?.description || '',
          editorData: editorData,
          identifier: identifier,
          name: meta?.title || '',
          tags: meta?.tags,
          tokenUsage: tokenUsage,
        };

        try {
          await marketApiService.createAgentVersion(versionPayload);
        } catch (versionError) {
          const errorMessage = versionError instanceof Error ? versionError.message : '未知错误';
          message.error({
            content: tSetting('marketPublish.modal.messages.createVersionFailed', {
              message: errorMessage,
            }),
            key: messageKey,
          });
          return false;
        }

        if (isSubmit) {
          updateSessionMeta({ marketIdentifier: identifier });
        }

        setPublishResult({ identifier });
        setShowResultModal(true);

        message.success({
          content: buttonCopy.successMessage,
          key: messageKey,
        });

        return true;
      } catch (error) {
        console.error('Market publish failed:', error);
        const errorMessage = error instanceof Error ? error.message : '发布失败';
        message.error({
          content: tSetting('marketPublish.modal.messages.publishFailed', {
            message: errorMessage,
          }),
          key: messageKey,
        });
        return false;
      } finally {
        setIsPublishing(false);
      }
    }, [
      agentConfig?.params,
      buttonCopy.successMessage,
      chatConfig?.displayMode,
      chatConfig?.enableHistoryCount,
      chatConfig?.historyCount,
      chatConfig?.searchMode,
      editorData,
      isAuthenticated,
      isSubmit,
      language,
      meta?.avatar,
      meta?.description,
      meta?.marketIdentifier,
      meta?.tags,
      meta?.title,
      model,
      plugins,
      provider,
      session?.accessToken,
      systemRole,
      tokenUsage,
      tSetting,
      updateSessionMeta,
    ]);

    const handleButtonClick = useCallback(async () => {
      if (!isAuthenticated) {
        try {
          message.loading({ content: tMarketAuth('messages.loading'), key: 'market-auth' });
          const accountId = await signIn();
          message.success({ content: buttonCopy.successMessage, key: 'market-auth' });

          let targetAction: MarketPublishAction = action;

          if (marketIdentifier && accountId !== null) {
            let accessToken = session?.accessToken;

            if (!accessToken && typeof window !== 'undefined') {
              const storedSession = sessionStorage.getItem('market_auth_session');
              if (storedSession) {
                try {
                  const parsed = JSON.parse(storedSession) as { accessToken?: string };
                  accessToken = parsed.accessToken;
                } catch (parseError) {
                  console.error(
                    '[MarketPublishButton] Failed to parse stored session:',
                    parseError,
                  );
                }
              }
            }

            if (accessToken) {
              try {
                const isOwner = await checkOwnership({
                  accessToken,
                  accountId,
                  marketIdentifier,
                  skipCache: true,
                });

                targetAction = isOwner ? 'upload' : 'submit';
              } catch (ownershipError) {
                console.error('[MarketPublishButton] Failed to confirm ownership:', ownershipError);
              }
            }
          }

          // After authentication, proceed with publish
          if (targetAction === action) {
            await handlePublish();
          }
        } catch (error) {
          console.error(`[MarketPublishButton][${action}] Authorization failed:`, error);
          const normalizedError = resolveMarketAuthError(error);
          message.error({
            content: tMarketAuth(`errors.${normalizedError.code}`),
            key: 'market-auth',
          });
        }
        return;
      }

      // User is authenticated, directly publish
      await handlePublish();
    }, [
      action,
      buttonCopy.successMessage,
      handlePublish,
      isAuthenticated,
      marketIdentifier,
      session?.accessToken,
      signIn,
      tMarketAuth,
    ]);

    const buttonProps = isAuthenticated ? buttonCopy.authenticated : buttonCopy.unauthenticated;
    const loading = isLoading || isPublishing;

    if (modal) {
      return (
        <>
          <Button
            block
            icon={buttonProps.icon}
            loading={loading}
            onClick={handleButtonClick}
            variant={'filled'}
          >
            {buttonProps.text}
          </Button>

          <PublishResultModal
            identifier={publishResult.identifier}
            onCancel={() => setShowResultModal(false)}
            open={showResultModal}
          />
        </>
      );
    }

    return (
      <>
        <ActionIcon
          icon={buttonProps.icon}
          loading={loading}
          onClick={handleButtonClick}
          size={HEADER_ICON_SIZE(mobile)}
          title={buttonProps.title}
        />

        <PublishResultModal
          identifier={publishResult.identifier}
          onCancel={() => setShowResultModal(false)}
          open={showResultModal}
        />
      </>
    );
  },
);

MarketPublishButton.displayName = 'MarketPublishButton';

export default MarketPublishButton;
