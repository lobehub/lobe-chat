'use client';

import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { type ModalProps } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  identifier: string;
}

const SubmitAgentModal = memo<ModalProps>(({ open, onCancel }) => {
  const { t } = useTranslation('setting');

  // 发布结果状态
  const [showResultModal, setShowResultModal] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    identifier?: string;
    isSuccess: boolean;
  }>({ isSuccess: false });

  // Market auth
  const { session: marketSession, isAuthenticated } = useMarketAuth();

  // Session store actions
  const updateSessionMeta = useSessionStore((s) => s.updateSessionMeta);

  // 获取所有配置数据
  const systemRole = useAgentStore(agentSelectors.currentAgentSystemRole);
  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);
  const language = useGlobalStore(globalGeneralSelectors.currentLanguage);
  const agentConfig = useAgentStore(agentSelectors.currentAgentConfig);
  const chatConfig = useAgentStore(agentChatConfigSelectors.currentChatConfig);
  const plugins = useAgentStore(agentSelectors.currentAgentPlugins);
  const ttsConfig = useAgentStore(agentSelectors.currentAgentTTS);
  const model = useAgentStore(agentSelectors.currentAgentModel);
  const provider = useAgentStore(agentSelectors.currentAgentModelProvider);
  const knowledgeBases = useAgentStore(agentSelectors.currentAgentKnowledgeBases);
  const files = useAgentStore(agentSelectors.currentAgentFiles);

  const handleSubmit = async (values: FormValues) => {
    if (!isAuthenticated || !marketSession?.accessToken) {
      message.error('请先登录市场账户');
      return false;
    }

    try {
      message.loading({ content: '正在发布助手...', key: 'submit' });

      // Set access token for API calls
      marketApiService.setAccessToken(marketSession.accessToken);

      // Check if agent already exists
      let agentResult;
      try {
        console.log('Checking if agent exists...');
        agentResult = await marketApiService.getAgentDetail(values.identifier);
        console.log('Agent already exists:', agentResult);
      } catch {
        // Agent doesn't exist, create it
        console.log('Agent does not exist, creating new agent...');
        const agentCreateData = {
          identifier: values.identifier,
          name: meta?.title || '未命名助手',
          status: 'published' as const,
          visibility: 'public' as const,
        };

        agentResult = await marketApiService.createAgent(agentCreateData);
        console.log('Agent created:', agentResult);
      }

      // Step 2: Create agent version with all configuration data
      console.log('Step 2: Creating agent version...');
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      const versionData = {
        a2aProtocolVersion: '1.0.0',
        avatar: meta?.avatar,
        category: meta?.tags?.[0] || 'general',
        changelog: values.changelog,
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
          systemRole: systemRole,
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
        identifier: values.identifier,
        name: meta?.title || '未命名助手',
        setAsCurrent: true,
        summary: meta?.description || systemRole?.slice(0, 100),
      };

      let versionResult;
      try {
        versionResult = await marketApiService.createAgentVersion(versionData);
        console.log('Version created:', versionResult);
      } catch (versionError) {
        console.error('Version creation failed:', versionError);
        if (
          versionError instanceof Error &&
          versionError.message.includes('duplicate key value violates unique constraint')
        ) {
          message.error({
            content: '该助手标识符已存在版本，请尝试使用不同的标识符或联系管理员',
            key: 'submit',
          });
        } else {
          const errorMessage = versionError instanceof Error ? versionError.message : '未知错误';
          message.error({
            content: `版本创建失败: ${errorMessage}`,
            key: 'submit',
          });
        }
        return false;
      }

      // Step 3: Update session meta with market identifier
      updateSessionMeta({
        marketIdentifier: values.identifier,
      });

      const { safetyCheck } = versionResult;

      // 显示发布结果模态框
      setPublishResult({
        identifier: values.identifier,
        isSuccess: safetyCheck === 'Safe',
      });
      setShowResultModal(true);

      message.destroy('submit'); // 清除loading消息
      return true; // 返回 true 表示提交成功，会自动关闭 Modal
    } catch (error) {
      console.error('Submit agent failed:', error);
      const errorMessage = error instanceof Error ? error.message : '发布失败';
      message.error({ content: `发布失败: ${errorMessage}`, key: 'submit' });
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
            children: '发布',
          },
        }}
        title={t('submitAgentModal.tooltips')}
        width="80vw"
      >
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
      </ModalForm>

      <PublishResultModal
        identifier={publishResult.identifier}
        isSuccess={publishResult.isSuccess}
        onCancel={() => setShowResultModal(false)}
        open={showResultModal}
      />
    </>
  );
});

export default SubmitAgentModal;
