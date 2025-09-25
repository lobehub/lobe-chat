'use client';

import { ProDescriptions } from '@ant-design/pro-components';
import { Tag } from 'antd';
import Image from 'next/image';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface AgentData {
  avatar?: string;
  description?: string;
  files?: Array<{
    enabled?: boolean;
    id: string;
    name: string;
    type: string;
  }>;
  knowledgeBases?: Array<{
    enabled?: boolean;
    id: string;
    name: string;
  }>;
  name?: string;
  tags?: string[];
  title?: string;
}

interface AgentConfig {
  params?: {
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
  };
}

interface ChatConfig {
  displayMode?: string;
  enableHistoryCount?: boolean;
  historyCount?: number;
  searchMode?: string;
}

interface TTSConfig {
  ttsService?: string;
  voice?: any;
}

interface AgentInfoDescriptionProps {
  agentConfig?: AgentConfig;
  chatConfig?: ChatConfig;
  files?: Array<{
    enabled?: boolean;
    id: string;
    name: string;
    type: string;
  }>;
  isRemote?: boolean;
  knowledgeBases?: Array<{
    enabled?: boolean;
    id: string;
    name: string;
  }>;
  meta?: AgentData;
  model?: string;
  plugins?: string[];
  provider?: string;
  systemRole?: string;
  ttsConfig?: TTSConfig;
}

const AgentInfoDescription = memo<AgentInfoDescriptionProps>(
  ({
    agentConfig,
    chatConfig,
    files = [],
    isRemote = false,
    knowledgeBases = [],
    meta,
    model,
    plugins = [],
    provider,
    systemRole,
    ttsConfig,
  }) => {
    // 转换远程数据格式
    const getProcessedData = () => {
      if (!isRemote || !meta) {
        return {
          agentConfig,
          chatConfig,
          files,
          knowledgeBases,
          meta,
          model,
          plugins,
          provider,
          systemRole,
          ttsConfig,
        };
      }

      // 远程数据格式转换
      const remoteData = meta as any;
      const config = remoteData.config || {};

      return {
        agentConfig: {
          params: config.model?.parameters || {},
        },
        chatConfig: config.chatConfig || {},
        files: config.files || [],
        knowledgeBases: config.knowledgeBases || [],
        meta: {
          avatar: remoteData.avatar,
          description: remoteData.description,
          name: remoteData.name,
          tags: remoteData.category ? [remoteData.category] : undefined,
          title: remoteData.name,
        },
        model: config.model?.model,
        plugins: config.plugins?.map((p: any) => (typeof p === 'string' ? p : p.identifier)) || [],
        provider: config.model?.provider,
        systemRole: config.systemRole,
        ttsConfig: config.tts || {},
      };
    };

    const {
      agentConfig: processedAgentConfig,
      chatConfig: processedChatConfig,
      // files: processedFiles,
      // knowledgeBases: processedKnowledgeBases,
      meta: processedMeta,
      model: processedModel,
      plugins: processedPlugins,
      provider: processedProvider,
      systemRole: processedSystemRole,
      // ttsConfig: processedTtsConfig,
    } = getProcessedData();
    const renderAvatar = (avatar: string | undefined) => {
      if (!avatar || avatar === '未设置') return '未设置';

      // 如果是 http 或 https 链接，显示图片
      if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
        return (
          <Image alt="avatar" height={40} src={avatar} style={{ borderRadius: '50%' }} width={40} />
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
    };

    return (
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
                render: (_: any, record: any) => renderAvatar(record.avatar),
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
              avatar: processedMeta?.avatar || '未设置',
              description: processedMeta?.description || '未设置',
              tags: processedMeta?.tags?.length ? processedMeta.tags : undefined,
              title: processedMeta?.title || processedMeta?.name || '未命名助手',
            }}
            size="small"
            title="助手信息"
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
                  return text;
                },
                title: '系统角色',
              },
            ]}
            dataSource={{
              systemRole: processedSystemRole || '未设置',
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
              maxTokens: processedAgentConfig?.params?.max_tokens ?? '未设置',
              model: processedModel || '未设置',
              provider: processedProvider || '未设置',
              temperature: processedAgentConfig?.params?.temperature ?? '未设置',
              topP: processedAgentConfig?.params?.top_p ?? '未设置',
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
              displayMode: processedChatConfig?.displayMode || '未设置',
              enableHistoryCount: processedChatConfig?.enableHistoryCount ? '是' : '否',
              historyCount: processedChatConfig?.historyCount ?? '未设置',
              searchMode: processedChatConfig?.searchMode || '未设置',
            }}
            size="small"
            title="聊天偏好"
          />

          {/* 语音服务 */}
          {/* <ProDescriptions
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
              ttsService: processedTtsConfig?.ttsService || '未设置',
              voice: JSON.stringify(processedTtsConfig?.voice) || '未设置',
            }}
            size="small"
            title="语音服务"
          /> */}

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
              plugins: processedPlugins?.length ? processedPlugins : [],
            }}
            size="small"
            title={`插件设置 (${processedPlugins?.length || 0}个)`}
          />

          {/* 知识库 */}
          {/* <ProDescriptions
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
              files: processedFiles?.length ? processedFiles : [],
              knowledgeBases: processedKnowledgeBases?.length ? processedKnowledgeBases : [],
            }}
            size="small"
            title={`知识库设置 (知识库: ${processedKnowledgeBases?.length || 0}个, 文件: ${processedFiles?.length || 0}个)`}
          /> */}
        </Flexbox>
      </div>
    );
  },
);

export default AgentInfoDescription;
