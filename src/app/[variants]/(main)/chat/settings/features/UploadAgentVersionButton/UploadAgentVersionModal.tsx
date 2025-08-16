'use client';

import { ModalForm, ProDescriptions, ProFormText } from '@ant-design/pro-components';
import { type ModalProps } from '@lobehub/ui';
import { Tag, Row, Col, Spin, Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { message } from '@/components/AntdStaticMethods';
import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { marketApiService } from '@/services/marketApi';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

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

const UploadAgentVersionModal = memo<UploadAgentVersionModalProps>(({ open, onCancel, onSuccess }) => {
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

  const fetchRemoteAgentData = async () => {
    if (!meta?.marketIdentifier || !marketSession?.accessToken) return;

    try {
      setLoadingRemoteData(true);
      marketApiService.setAccessToken(marketSession.accessToken);
      const data = await marketApiService.getAgentDetail(meta.marketIdentifier);
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
          // Files
          files: files?.map((file) => ({
            enabled: file.enabled,
            id: file.id,
            name: file.name,
            type: file.type,
          })) || [],

          // Knowledge bases
          knowledgeBases: knowledgeBases?.map((kb) => ({
            enabled: kb.enabled,
            id: kb.id,
            name: kb.name,
          })) || [],

          // Language
          locale: language,

          // Model configuration
          model: {
            model,
            parameters: agentConfig?.params,
            provider,
          },
          // Plugins
          plugins: plugins?.map((plugin) => ({
            enabled: true,
            identifier: plugin,
            settings: {},
          })) || [],
          // System role and description
          systemRole: systemRole || '你是一个有用的助手。',
          // TTS configuration
          tts: {
            ttsService: ttsConfig?.ttsService,
            voice: ttsConfig?.voice,
          },
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

      message.success({ content: '新版本发布成功！', key: 'upload-version' });
      onSuccess?.(); // 调用成功回调关闭Modal
      return true; // 返回 true 表示提交成功，会自动关闭 Modal

    } catch (error) {
      console.error('Upload version failed:', error);
      const errorMessage = error instanceof Error ? error.message : '发布失败';
      message.error({ content: `发布失败: ${errorMessage}`, key: 'upload-version' });
      return false;
    }
  };

  const renderAgentInfo = (data: any, title: string, isRemote = false) => (
    <div style={{ height: '500px', overflow: 'auto' }}>
      <Flexbox gap={16}>
        {/* 基础信息 */}
        <ProDescriptions
          bordered
          column={2}
          columns={[
            {
              dataIndex: 'title',
              key: 'title',
              title: '名称',
            },
            {
              dataIndex: 'avatar',
              key: 'avatar',
              render: (_: any, record: any) => {
                const avatar = record.avatar;
                if (!avatar || avatar === '未设置') return '未设置';

                // 如果是 http 或 https 链接，显示图片
                if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
                  return (
                    <img
                      alt="avatar"
                      src={avatar}
                      style={{ borderRadius: '50%', height: 40, width: 40 }}
                    />
                  );
                }

                // 否则直接显示字符（emoji）
                return (
                  <div
                    style={{
                      fontSize: '24px',
                      height: 40,
                      lineHeight: '40px',
                      textAlign: 'center',
                      width: 40,
                    }}
                  >
                    {avatar}
                  </div>
                );
              },
              title: '头像',
            },
            {
              dataIndex: 'description',
              key: 'description',
              span: 2,
              title: '描述',
            },
            {
              dataIndex: 'tags',
              key: 'tags',
              render: (_: any, record: any) => {
                const tags = record.tags;
                if (!tags || !tags.length) return '未设置';
                return tags.map((tag: string, index: number) => (
                  <Tag color="blue" key={index}>
                    {tag}
                  </Tag>
                ));
              },
              span: 2,
              title: '标签',
            },
          ]}
          dataSource={{
            avatar: isRemote ? data?.avatar : (data?.avatar || '未设置'),
            description: isRemote ? data?.description : (data?.description || '未设置'),
            tags: isRemote ? data?.tags : (data?.tags?.length ? data.tags : undefined),
            title: isRemote ? data?.name : (data?.title || '未命名助手'),
          }}
          size="small"
          title={title}
        />

        {/* 角色设定 */}
        <ProDescriptions
          bordered
          column={1}
          columns={[
            {
              dataIndex: 'systemRole',
              key: 'systemRole',
              render: (_: any, record: any) => {
                const text = record.systemRole;
                if (text === '未设置') return text;
                return (
                  <Typography.Text
                    ellipsis={{
                      tooltip: '点击查看完整内容',
                    }}
                  >
                    {text}
                  </Typography.Text>
                );
              },
              title: '系统角色',
            },
          ]}
          dataSource={{
            systemRole: isRemote ? '远程数据暂不显示系统角色' : (systemRole || '未设置'),
          }}
          size="small"
          title="角色设定"
        />

        {/* 模型设置 */}
        <ProDescriptions
          bordered
          column={2}
          columns={[
            {
              dataIndex: 'model',
              key: 'model',
              title: '模型',
            },
            {
              dataIndex: 'provider',
              key: 'provider',
              title: '提供商',
            },
            {
              dataIndex: 'temperature',
              key: 'temperature',
              title: '温度',
            },
            {
              dataIndex: 'topP',
              key: 'topP',
              title: 'Top P',
            },
            {
              dataIndex: 'maxTokens',
              key: 'maxTokens',
              span: 2,
              title: '最大令牌数',
            },
          ]}
          dataSource={{
            maxTokens: isRemote ? '远程数据暂不显示' : (agentConfig?.params?.max_tokens ?? '未设置'),
            model: isRemote ? '远程数据暂不显示' : (model || '未设置'),
            provider: isRemote ? '远程数据暂不显示' : (provider || '未设置'),
            temperature: isRemote ? '远程数据暂不显示' : (agentConfig?.params?.temperature ?? '未设置'),
            topP: isRemote ? '远程数据暂不显示' : (agentConfig?.params?.top_p ?? '未设置'),
          }}
          size="small"
          title="模型设置"
        />

        {/* 聊天偏好 */}
        <ProDescriptions
          bordered
          column={2}
          columns={[
            {
              dataIndex: 'historyCount',
              key: 'historyCount',
              title: '历史消息数',
            },
            {
              dataIndex: 'enableHistoryCount',
              key: 'enableHistoryCount',
              title: '启用历史计数',
            },
            {
              dataIndex: 'displayMode',
              key: 'displayMode',
              title: '显示模式',
            },
            {
              dataIndex: 'searchMode',
              key: 'searchMode',
              title: '搜索模式',
            },
          ]}
          dataSource={{
            displayMode: isRemote ? '远程数据暂不显示' : (chatConfig?.displayMode || '未设置'),
            enableHistoryCount: isRemote ? '远程数据暂不显示' : (chatConfig?.enableHistoryCount ? '是' : '否'),
            historyCount: isRemote ? '远程数据暂不显示' : (chatConfig?.historyCount ?? '未设置'),
            searchMode: isRemote ? '远程数据暂不显示' : (chatConfig?.searchMode || '未设置'),
          }}
          size="small"
          title="聊天偏好"
        />

        {/* 语音服务 */}
        <ProDescriptions
          bordered
          column={2}
          columns={[
            {
              dataIndex: 'ttsService',
              key: 'ttsService',
              title: 'TTS服务',
            },
            {
              dataIndex: 'voice',
              key: 'voice',
              title: '语音设置',
            },
          ]}
          dataSource={{
            ttsService: isRemote ? '远程数据暂不显示' : (ttsConfig?.ttsService || '未设置'),
            voice: isRemote ? '远程数据暂不显示' : (JSON.stringify(ttsConfig?.voice) || '未设置'),
          }}
          size="small"
          title="语音服务"
        />

        {/* 插件设置 */}
        <ProDescriptions
          bordered
          column={1}
          columns={[
            {
              dataIndex: 'plugins',
              key: 'plugins',
              render: (_: any, record: any) => {
                const pluginList = record.plugins;
                if (!pluginList?.length) return '未安装插件';
                return pluginList.map((plugin: string, index: number) => (
                  <Tag color="green" key={index}>
                    {plugin}
                  </Tag>
                ));
              },
              title: '已安装插件',
            },
          ]}
          dataSource={{
            plugins: isRemote ? [] : (plugins?.length ? plugins : []),
          }}
          size="small"
          title={`插件设置 (${isRemote ? '远程数据暂不显示' : (plugins?.length || 0) + '个'})`}
        />

        {/* 知识库 */}
        <ProDescriptions
          bordered
          column={1}
          columns={[
            {
              dataIndex: 'knowledgeBases',
              key: 'knowledgeBases',
              render: (_: any, record: any) => {
                const kbList = record.knowledgeBases;
                if (!kbList?.length) return '未配置知识库';
                return kbList.map((kb: any, index: number) => (
                  <Tag color={kb.enabled ? 'blue' : 'default'} key={index}>
                    {kb.name} {kb.enabled ? '(已启用)' : '(已禁用)'}
                  </Tag>
                ));
              },
              title: '知识库',
            },
            {
              dataIndex: 'files',
              key: 'files',
              render: (_: any, record: any) => {
                const fileList = record.files;
                if (!fileList?.length) return '未上传文件';
                return fileList.map((file: any, index: number) => (
                  <Tag color={file.enabled ? 'orange' : 'default'} key={index}>
                    {file.name} ({file.type}) {file.enabled ? '(已启用)' : '(已禁用)'}
                  </Tag>
                ));
              },
              title: '文件',
            },
          ]}
          dataSource={{
            files: isRemote ? [] : (files?.length ? files : []),
            knowledgeBases: isRemote ? [] : (knowledgeBases?.length ? knowledgeBases : []),
          }}
          size="small"
          title={`知识库设置 (${isRemote ? '远程数据暂不显示' : `知识库: ${knowledgeBases?.length || 0}个, 文件: ${files?.length || 0}个`})`}
        />
      </Flexbox>
    </div>
  );

  return (
    <ModalForm<FormValues>
      modalProps={{
        bodyStyle: { maxHeight: '80vh', overflow: 'auto' },
        destroyOnClose: true,
        onCancel,
        width: 1200,
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
              renderAgentInfo(remoteAgentData, '远程版本信息', true)
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
            {renderAgentInfo(meta, '本地版本信息')}
          </div>
        </Col>
      </Row>
    </ModalForm>
  );
});

export default UploadAgentVersionModal;