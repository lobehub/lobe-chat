'use client';

import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { type ModalProps } from '@lobehub/ui';
import { Col, Row, Spin } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useEffect, useState } from 'react';

import { message } from '@/components/AntdStaticMethods';
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

interface FormValues {
  changelog: string;
}

interface RemoteAgentData {
  avatar?: string;
  description: string;
  identifier: string;
  name: string;
  tags?: string[];
  // Add other fields as needed
}

interface UploadAgentVersionModalProps extends ModalProps {
  onSuccess?: () => void;
}

const UploadAgentVersionModal = memo<UploadAgentVersionModalProps>(
  ({ open, onCancel, onSuccess }) => {
    // Market auth
    const { session: marketSession, isAuthenticated } = useMarketAuth();
    const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);

    // Agent data
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

    // Remote agent data state
    const [remoteAgentData, setRemoteAgentData] = useState<RemoteAgentData | null>(null);
    const [loadingRemoteData, setLoadingRemoteData] = useState(false);

    // 发布结果状态
    const [showResultModal, setShowResultModal] = useState(false);
    const [publishResult, setPublishResult] = useState<{ identifier?: string }>({});

    const fetchRemoteAgentData = async () => {
      if (!meta?.marketIdentifier || !marketSession?.accessToken) return;

      try {
        setLoadingRemoteData(true);
        marketApiService.setAccessToken(marketSession.accessToken);
        const data = await marketApiService.getAgentDetail(meta.marketIdentifier);
        console.log('getAgentDetail', data);
        setRemoteAgentData(data);
      } catch (error) {
        console.error('Failed to fetch remote agent data:', error);
        message.error('获取远程助手数据失败');
      } finally {
        setLoadingRemoteData(false);
      }
    };

    // Fetch remote agent data when modal opens
    useEffect(() => {
      if (open && meta?.marketIdentifier && isAuthenticated && marketSession?.accessToken) {
        fetchRemoteAgentData();
      }
    }, [open, meta?.marketIdentifier, isAuthenticated, marketSession?.accessToken]);

    const handleSubmit = async (values: FormValues) => {
      if (!isAuthenticated || !marketSession?.accessToken || !meta?.marketIdentifier) {
        message.error('请先登录市场账户');
        return false;
      }

      try {
        message.loading({ content: '正在发布新版本...', key: 'upload-version' });

        // Set access token for API calls
        marketApiService.setAccessToken(marketSession.accessToken);

        // Create agent version with all configuration data
        console.log('Creating new agent version...');
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        const versionData = {
          a2aProtocolVersion: '1.0.0',
          avatar: meta?.avatar,
          category: meta?.tags?.[0] || 'general',
          changelog: values.changelog,
          config: {
            // Chat configuration
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
            // TODO: Files and Knowledge bases temporarily disabled
            // Files
            // files:
            //   files?.map((file) => ({
            //     enabled: file.enabled,
            //     id: file.id,
            //     name: file.name,
            //     type: file.type,
            //   })) || [],

            // Knowledge bases
            // knowledgeBases:
            //   knowledgeBases?.map((kb) => ({
            //     enabled: kb.enabled,
            //     id: kb.id,
            //     name: kb.name,
            //   })) || [],

            // Language
            locale: language,

            // Model configuration
            model: {
              model,
              parameters: agentConfig?.params,
              provider,
            },
            // Plugins
            plugins:
              plugins?.map((plugin) => ({
                enabled: true,
                identifier: plugin,
                settings: {},
              })) || [],
            // System role and description
            systemRole: systemRole || '你是一个有用的助手。',
            // TODO: TTS configuration temporarily disabled
            // TTS configuration
            // tts: {
            //   ttsService: ttsConfig?.ttsService,
            //   voice: ttsConfig?.voice,
            // },
          },
          defaultInputModes: ['text'],
          defaultOutputModes: ['text'],
          description: meta?.description || '',
          identifier: meta.marketIdentifier,
          name: meta?.title || '未命名助手',
          setAsCurrent: true,
          summary: meta?.description || systemRole?.slice(0, 100),
        };

        const versionResult = await marketApiService.createAgentVersion(versionData);
        console.log('Version created:', versionResult);

        // 显示发布结果模态框
        setPublishResult({
          identifier: meta.marketIdentifier,
        });
        setShowResultModal(true);

        message.destroy('upload-version'); // 清除loading消息
        onSuccess?.(); // 调用成功回调关闭Modal
        return true; // 返回 true 表示提交成功，会自动关闭 Modal
      } catch (error) {
        console.error('Upload version failed:', error);
        const errorMessage = error instanceof Error ? error.message : '发布失败';
        message.error({ content: `发布失败: ${errorMessage}`, key: 'upload-version' });
        return false;
      }
    };

    return (
      <>
        <ModalForm<FormValues>
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
              children: '发布新版本',
            },
          }}
          title="发布新版本"
          width="80vw"
        >
          {/* 变更日志输入 */}
          <div style={{ marginBottom: 24 }}>
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
          </div>

          {/* 对比显示 */}
          <Row gutter={24}>
            <Col span={12}>
              <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px' }}>
                <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>当前发布版本</h3>
                {loadingRemoteData ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>正在加载远程数据...</div>
                  </div>
                ) : remoteAgentData ? (
                  <AgentInfoDescription isRemote={true} meta={remoteAgentData} />
                ) : (
                  <div style={{ color: '#999', padding: '40px', textAlign: 'center' }}>
                    暂无远程数据
                  </div>
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

export default UploadAgentVersionModal;
