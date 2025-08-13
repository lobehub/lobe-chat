'use client';

import { ModalForm, ProDescriptions, ProFormText } from '@ant-design/pro-components';
import { type ModalProps } from '@lobehub/ui';
import { Tag, Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentSelectors, agentChatConfigSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

interface FormValues {
  identifier: string;
}

const SubmitAgentModal = memo<ModalProps>(({ open, onCancel }) => {
  const { t } = useTranslation('setting');
  
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

  // 构建完整的配置数据
  const getCompleteAgentData = (identifier: string) => {
    return {
      // 基础信息
      identifier,
      meta: {
        avatar: meta?.avatar,
        description: meta?.description,
        tags: meta?.tags,
        title: meta?.title,
      },
      // 聊天偏好
      chatConfig: {
        displayMode: chatConfig?.displayMode,
        enableHistoryCount: chatConfig?.enableHistoryCount,
        historyCount: chatConfig?.historyCount,
        maxTokens: agentConfig?.params?.max_tokens,
        searchMode: chatConfig?.searchMode,
        temperature: agentConfig?.params?.temperature,
        topP: agentConfig?.params?.top_p,
      },
      // 知识库
      knowledge: {
        files: files?.map(file => ({
          enabled: file.enabled,
          id: file.id,
          name: file.name,
          type: file.type,
        })),
        knowledgeBases: knowledgeBases?.map(kb => ({
          enabled: kb.enabled,
          id: kb.id,
          name: kb.name,
        })),
      },
      // 其他配置
      locale: language,
      // 模型设置
      model: {
        model,
        parameters: agentConfig?.params,
        provider,
      },
      // 插件设置
      plugins: plugins?.map(plugin => ({
        enabled: false,
        identifier: plugin,
        name: plugin,
        settings: {},
      })),
      // 角色设定
      systemRole,
      // 语音服务
      tts: {
        ttsService: ttsConfig?.ttsService,
        voice: ttsConfig?.voice,
      },
    };
  };

  const handleSubmit = async (values: FormValues) => {
    const agentData = getCompleteAgentData(values.identifier);
    console.log('Complete Agent Data:', JSON.stringify(agentData, null, 2));
    console.log('Agent Data Object:', agentData);
    console.log('Form Values:', values);
    
    // 这里可以添加实际的API调用
    // await submitAgent(agentData);
    
    return true; // 返回 true 表示提交成功，会自动关闭 Modal
  };

  return (
    <ModalForm<FormValues>
      title={t('submitAgentModal.tooltips')}
      open={open}
      onCancel={onCancel}
      onFinish={handleSubmit}
      width={800}
      modalProps={{
        destroyOnClose: true,
        bodyStyle: { maxHeight: '60vh', overflow: 'auto' },
      }}
      submitter={{
        submitButtonProps: {
          children: '发布',
        },
        resetButtonProps: {
          style: { display: 'none' },
        },
      }}
    >
      {/* 标识符输入 */}
      <ProFormText
        name="identifier"
        label="助手标识符"
        placeholder="请输入助手的唯一标识符，如: web-development"
        rules={[
          { required: true, message: '请输入助手标识符' },
          { pattern: /^[a-z0-9-]+$/, message: '标识符只能包含小写字母、数字和连字符' },
          { min: 3, max: 50, message: '标识符长度应在3-50个字符之间' },
        ]}
        extra="标识符将作为助手的唯一标识，建议使用小写字母、数字和连字符"
      />

      <div style={{ marginTop: 24 }}>
        <Flexbox gap={24}>
        {/* 基础信息 */}
        <ProDescriptions
          bordered
          column={2}
          size="small"
          title="助手信息"
          dataSource={{
            avatar: meta?.avatar || '未设置',
            description: meta?.description || '未设置',
            tags: meta?.tags?.length ? meta.tags : '未设置',
            title: meta?.title || '未设置',
          }}
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
                if (avatar === '未设置') return avatar;
                
                // 如果是 http 或 https 链接，显示图片
                if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
                  return <img alt="avatar" src={avatar} style={{ borderRadius: '50%', height: 40, width: 40 }} />;
                }
                
                // 否则直接显示字符（emoji）
                return (
                  <div style={{ 
                    fontSize: '24px', 
                    height: 40,
                    lineHeight: '40px',
                    textAlign: 'center',
                    width: 40,
                  }}>
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
                if (tags === '未设置') return tags;
                if (Array.isArray(tags)) {
                  return tags.map((tag, index) => (
                    <Tag color="blue" key={index}>{tag}</Tag>
                  ));
                }
                return tags;
              },
              span: 2,
              title: '标签',
            },
          ]}
        />

        {/* 角色设定 */}
        <ProDescriptions
          bordered
          column={1}
          size="small"
          title="角色设定"
          dataSource={{
            systemRole: systemRole || '未设置',
          }}
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
                      tooltip: '点击查看完整内容'
                    }}
                  >
                    {text}
                  </Typography.Text>
                );
              },
              title: '系统角色',
            },
          ]}
        />

        {/* 模型设置 */}
        <ProDescriptions
          bordered
          column={2}
          size="small"
          title="模型设置"
          dataSource={{
            maxTokens: agentConfig?.params?.max_tokens ?? '未设置',
            model: model || '未设置',
            provider: provider || '未设置',
            temperature: agentConfig?.params?.temperature ?? '未设置',
            topP: agentConfig?.params?.top_p ?? '未设置',
          }}
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
        />

        {/* 聊天偏好 */}
        <ProDescriptions
          bordered
          column={2}
          size="small"
          title="聊天偏好"
          dataSource={{
            displayMode: chatConfig?.displayMode || '未设置',
            enableHistoryCount: chatConfig?.enableHistoryCount ? '是' : '否',
            historyCount: chatConfig?.historyCount ?? '未设置',
            searchMode: chatConfig?.searchMode || '未设置',
          }}
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
        />

        {/* 语音服务 */}
        <ProDescriptions
          bordered
          column={2}
          size="small"
          title="语音服务"
          dataSource={{
            ttsService: ttsConfig?.ttsService || '未设置',
            voice: JSON.stringify(ttsConfig?.voice) || '未设置',
          }}
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
        />

        {/* 插件设置 */}
        <ProDescriptions
          bordered
          column={1}
          size="small"
          title={`插件设置 (${plugins?.length || 0}个)`}
          dataSource={{
            plugins: plugins?.length ? plugins : [],
          }}
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
        />

        {/* 知识库 */}
        <ProDescriptions
          bordered
          column={1}
          size="small"
          title={`知识库设置 (知识库: ${knowledgeBases?.length || 0}个, 文件: ${files?.length || 0}个)`}
          dataSource={{
            files: files?.length ? files : [],
            knowledgeBases: knowledgeBases?.length ? knowledgeBases : [],
          }}
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
        />
        </Flexbox>
      </div>
    </ModalForm>
  );
});

export default SubmitAgentModal;