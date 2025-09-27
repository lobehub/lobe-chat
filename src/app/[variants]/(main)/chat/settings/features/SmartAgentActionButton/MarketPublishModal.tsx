'use client';

import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { type ModalProps } from '@lobehub/ui';
import { Col, Row, Spin } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { message } from '@/components/AntdStaticMethods';
import { useTokenCount } from '@/hooks/useTokenCount';
import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { marketApiService } from '@/services/marketApi';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import AgentInfoDescription from '../AgentInfoDescription';
import PublishResultModal from '../PublishResultModal';

export type MarketPublishAction = 'submit' | 'upload';

interface MarketPublishModalProps extends ModalProps {
  action: MarketPublishAction;
  onSuccess?: () => void;
}

interface MarketPublishFormValues {
  changelog: string;
  identifier?: string;
}

interface RemoteAgentData {
  avatar?: string;
  description: string;
  identifier: string;
  name: string;
  tags?: string[];
}

const MarketPublishModal = memo<MarketPublishModalProps>(
  ({ action, open, onCancel, onSuccess }) => {
    const { t } = useTranslation('setting');
    const isSubmit = action === 'submit';
    const isUpload = action === 'upload';

    const { session: marketSession, isAuthenticated } = useMarketAuth();
    const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);
    const updateSessionMeta = useSessionStore((s) => s.updateSessionMeta);

    const systemRole = useAgentStore(agentSelectors.currentAgentSystemRole);
    const language = useGlobalStore(globalGeneralSelectors.currentLanguage);
    const agentConfig = useAgentStore(agentSelectors.currentAgentConfig);
    const chatConfig = useAgentStore(agentChatConfigSelectors.currentChatConfig);
    const plugins = useAgentStore(agentSelectors.currentAgentPlugins);
    const ttsConfig = useAgentStore(agentSelectors.currentAgentTTS);
    const model = useAgentStore(agentSelectors.currentAgentModel);
    const provider = useAgentStore(agentSelectors.currentAgentModelProvider);
    const knowledgeBases = useAgentStore(agentSelectors.currentAgentKnowledgeBases);
    const files = useAgentStore(agentSelectors.currentAgentFiles);

    const [remoteAgentData, setRemoteAgentData] = useState<RemoteAgentData | null>(null);
    const [loadingRemoteData, setLoadingRemoteData] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [publishResult, setPublishResult] = useState<{ identifier?: string }>({});

    const messageKey = isSubmit ? 'submit' : 'upload-version';
    const loadingMessage = isSubmit ? '正在发布助手...' : '正在发布新版本...';
    const submitButtonText = isSubmit ? '发布' : '发布新版本';
    const modalTitle = isSubmit ? t('submitAgentModal.tooltips') : '发布新版本';

    useEffect(() => {
      if (!isUpload) return;
      const marketIdentifier = meta?.marketIdentifier;
      const accessToken = marketSession?.accessToken;
      if (!open || !isAuthenticated || !accessToken || !marketIdentifier) return;

      let cancelled = false;

      const run = async () => {
        try {
          setLoadingRemoteData(true);
          marketApiService.setAccessToken(accessToken);
          const data = await marketApiService.getAgentDetail(marketIdentifier);
          if (!cancelled) {
            console.log('data', data);
            setRemoteAgentData(data);
          }
        } catch (error) {
          console.error('Failed to fetch remote agent data:', error);
          if (!cancelled) {
            message.error('获取远程助手数据失败');
          }
        } finally {
          if (!cancelled) {
            setLoadingRemoteData(false);
          }
        }
      };

      void run();

      return () => {
        cancelled = true;
      };
    }, [isAuthenticated, isUpload, marketSession?.accessToken, meta?.marketIdentifier, open]);

    const tokenUsage = useTokenCount(systemRole);

    const handleSubmit = useCallback(
      async (values: MarketPublishFormValues) => {
        if (!isAuthenticated || !marketSession?.accessToken) {
          message.error('请先登录市场账户');
          return false;
        }

        const changelog = values.changelog?.trim();
        if (!changelog) {
          message.error({ content: '请输入变更日志', key: messageKey });
          return false;
        }

        let identifier = meta?.marketIdentifier;

        try {
          message.loading({ content: loadingMessage, key: messageKey });
          marketApiService.setAccessToken(marketSession.accessToken);

          if (isSubmit) {
            identifier = values.identifier?.trim();
            if (!identifier) {
              message.error({ content: '请输入助手标识符', key: messageKey });
              return false;
            }

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
            message.error({ content: '当前助手还没有市场标识符', key: messageKey });
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
                plugins?.map((plugin) => ({
                  enabled: true,
                  identifier: plugin,
                  settings: {},
                })) || [],
              systemRole: systemRole,
            },
            description: meta?.description || '',
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
              content: `版本创建失败: ${errorMessage}`,
              key: messageKey,
            });
            return false;
          }

          if (isSubmit) {
            updateSessionMeta({ marketIdentifier: identifier });
          }

          setPublishResult({ identifier });
          setShowResultModal(true);

          message.destroy(messageKey);
          onSuccess?.();
          return true;
        } catch (error) {
          console.error('Market publish failed:', error);
          const errorMessage = error instanceof Error ? error.message : '发布失败';
          message.error({ content: `发布失败: ${errorMessage}`, key: messageKey });
          return false;
        }
      },
      [
        agentConfig?.params,
        chatConfig?.displayMode,
        chatConfig?.enableHistoryCount,
        chatConfig?.historyCount,
        chatConfig?.searchMode,
        isAuthenticated,
        isSubmit,
        language,
        meta?.avatar,
        meta?.description,
        meta?.marketIdentifier,
        meta?.tags,
        meta?.title,
        marketSession?.accessToken,
        messageKey,
        loadingMessage,
        model,
        onSuccess,
        plugins,
        provider,
        systemRole,
        tokenUsage,
        updateSessionMeta,
      ],
    );

    return (
      <>
        <ModalForm<MarketPublishFormValues>
          modalProps={{
            bodyStyle: { height: '70vh', overflow: 'auto' },
            destroyOnClose: true,
            onCancel,
            style: { minWidth: 750 },
          }}
          onFinish={handleSubmit}
          open={open}
          submitter={{
            resetButtonProps: {
              style: { display: 'none' },
            },
            submitButtonProps: {
              children: submitButtonText,
            },
          }}
          title={modalTitle}
          width="80vw"
        >
          {isSubmit && (
            <ProFormText
              extra="标识符将作为助手的唯一标识，建议使用小写字母、数字和连字符"
              label="助手标识符"
              name="identifier"
              placeholder="请输入助手的唯一标识符，如: web-development"
              rules={[
                { message: '请输入助手标识符', required: true },
                { message: '标识符只能包含小写字母、数字和连字符', pattern: /^[\da-z-]+$/ },
                { max: 50, message: '标识符长度应在3-50个字符之间', min: 3 },
              ]}
            />
          )}

          <ProFormText
            extra="描述此版本的主要变更和改进"
            label="变更日志"
            name="changelog"
            placeholder="请输入变更日志"
            rules={[
              { message: '请输入变更日志', required: true },
              { max: 500, message: '变更日志不能超过500个字符' },
            ]}
          />

          {isUpload ? (
            <Row gutter={24}>
              <Col span={12}>
                <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px' }}>
                  <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>当前发布版本</h3>
                  {loadingRemoteData ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: '16px' }}>正在加载远程数据...</div>
                    </div>
                  ) : (
                    <AgentInfoDescription isRemote={true} meta={remoteAgentData || {}} />
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px' }}>
                  <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>本地当前版本</h3>
                  <AgentInfoDescription
                    agentConfig={agentConfig}
                    chatConfig={chatConfig}
                    files={files}
                    knowledgeBases={knowledgeBases}
                    meta={meta}
                    model={model}
                    plugins={plugins}
                    provider={provider}
                    systemRole={systemRole}
                    ttsConfig={ttsConfig}
                  />
                </div>
              </Col>
            </Row>
          ) : (
            <div style={{ marginTop: 24 }}>
              <AgentInfoDescription
                agentConfig={agentConfig}
                chatConfig={chatConfig}
                files={files}
                knowledgeBases={knowledgeBases}
                meta={meta}
                model={model}
                plugins={plugins}
                provider={provider}
                systemRole={systemRole}
                ttsConfig={ttsConfig}
              />
            </div>
          )}
        </ModalForm>

        <PublishResultModal
          identifier={publishResult.identifier}
          onCancel={() => setShowResultModal(false)}
          open={showResultModal}
        />
      </>
    );
  },
);

MarketPublishModal.displayName = 'MarketPublishModal';

export default MarketPublishModal;
