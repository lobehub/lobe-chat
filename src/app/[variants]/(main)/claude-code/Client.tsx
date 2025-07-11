'use client';

import { ClaudeCodeMessage } from '@lobechat/electron-client-ipc';
import { CodeEditor, Markdown, Text } from '@lobehub/ui';
import { Button, Card, Empty, List, Space, Tabs, Tag, message } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useEffect, useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import PageTitle from '@/components/PageTitle';
import { isDesktop } from '@/const/version';
import { useElectronStore } from '@/store/electron';
import { claudeCodeSelectors } from '@/store/electron/selectors';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: ${token.paddingLG}px;
    height: 100%;
    overflow: auto;
  `,

  editorCard: css`
    .ant-card-body {
      padding: 0;
    }
  `,

  messageCard: css`
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadius}px;
    padding: ${token.padding}px;
    margin-bottom: ${token.marginSM}px;
  `,

  sessionItem: css`
    cursor: pointer;
    transition: all ${token.motionDurationMid} ${token.motionEaseInOut};

    &:hover {
      background: ${token.colorBgTextHover};
    }
  `,

  statusCard: css`
    background: ${token.colorBgElevated};
  `,
}));

const Client = memo(() => {
  const { styles } = useStyles();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ClaudeCodeMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('query');

  // 获取操作方法
  const [
    startStreamingQuery,
    // stopStreaming,
    abort,
    fetchRecentSessions,
    clearSession,
    checkAvailability,
  ] = useElectronStore((s) => [
    s.startStreamingQuery,
    // s.stopStreaming,
    s.abort,
    s.fetchRecentSessions,
    s.clearSession,
    s.checkAvailability,
  ]);

  // 获取状态
  const [
    isAvailable,
    isLoading,
    error,
    apiKeySource,
    version,
    recentSessions,
    useClaudeCodeListeners,
  ] = useElectronStore((s) => [
    claudeCodeSelectors.isAvailable(s),
    claudeCodeSelectors.isLoading(s),
    claudeCodeSelectors.error(s),
    claudeCodeSelectors.apiKeySource(s),
    claudeCodeSelectors.version(s),
    claudeCodeSelectors.recentSessions(s),
    s.useClaudeCodeListeners,
  ]);

  // 设置监听器
  useClaudeCodeListeners({
    onStreamComplete: (sessionId) => {
      setCurrentSessionId(sessionId);
      message.success('Query completed');
      fetchRecentSessions();
    },
    onStreamError: (err) => {
      message.error(`Error: ${err}`);
    },
    onStreamMessage: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
  });

  // 初始化时检查可用性
  useEffect(() => {
    checkAvailability();
  }, []);

  // 执行查询
  const handleQuery = async () => {
    if (!prompt?.trim?.()) {
      message.warning('Please enter a prompt');
      return;
    }

    try {
      setMessages([]);
      await startStreamingQuery(prompt, {
        allowedTools: ['Read', 'Write', 'Bash'],
        maxTurns: 5,
        outputFormat: 'stream-json',
      });
    } catch (err) {
      message.error(`Query failed: ${(err as Error).message}`);
    }
  };

  // 继续会话
  const handleContinueSession = async (sessionId: string) => {
    try {
      setMessages([]);
      setCurrentSessionId(sessionId);
      await startStreamingQuery(prompt || 'Continue working on this', {
        outputFormat: 'stream-json',
        resumeSessionId: sessionId,
      });
    } catch (err) {
      message.error(`Failed to continue session: ${(err as Error).message}`);
    }
  };

  // 渲染消息
  const renderMessage = (msg: ClaudeCodeMessage) => {
    if (msg.type === 'result') {
      return (
        <div className={styles.messageCard}>
          <Space direction="vertical" size="small">
            <Text strong>Result</Text>
            {msg.subtype && <Tag color={msg.is_error ? 'error' : 'success'}>{msg.subtype}</Tag>}
            <Text type="secondary">
              Duration: {msg.duration_ms}ms | API: {msg.duration_api_ms}ms | Turns: {msg.num_turns}
            </Text>
            {msg.total_cost_usd && (
              <Text type="secondary">Cost: ${msg.total_cost_usd.toFixed(4)}</Text>
            )}
            {msg.result && <Text>{msg.result}</Text>}
          </Space>
        </div>
      );
    }

    if (msg.type === 'system' && msg.subtype === 'init') {
      return (
        <div className={styles.messageCard}>
          <Space direction="vertical" size="small">
            <Text strong>System Initialization</Text>
            <Text type="secondary">Model: {msg.model}</Text>
            <Text type="secondary">Working Directory: {msg.cwd}</Text>
            <Text type="secondary">Available Tools: {msg.tools?.join(', ')}</Text>
          </Space>
        </div>
      );
    }

    if (msg.message) {
      const content = msg.message.content?.[0]?.text || JSON.stringify(msg.message, null, 2);
      return (
        <div className={styles.messageCard}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text strong>{msg.type === 'assistant' ? '🤖 Assistant' : '👤 User'}</Text>
            <Markdown>{content}</Markdown>
          </Space>
        </div>
      );
    }

    return null;
  };

  if (!isDesktop) {
    return (
      <Center height="100%" width="100%">
        <Empty
          description="Claude Code is only available in the desktop app"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Center>
    );
  }

  if (!isAvailable) {
    return (
      <Center height="100%" width="100%">
        <Card className={styles.statusCard}>
          <Space align="center" direction="vertical">
            <Text as={'h4'}>Claude Code is not available</Text>
            {error && <Text type="danger">{error}</Text>}
            <Text type="secondary">
              Please ensure you have set ANTHROPIC_API_KEY environment variable
            </Text>
          </Space>
        </Card>
      </Center>
    );
  }

  const tabItems = [
    {
      children: (
        <Flexbox gap={16} height="100%">
          <Card className={styles.editorCard}>
            <CodeEditor
              height="200px"
              language="markdown"
              onValueChange={(v) => {
                setPrompt(v);
              }}
              placeholder="Enter your prompt here..."
              style={{ fontSize: 14 }}
              value={prompt}
            />
          </Card>

          <Space>
            <Button
              disabled={!prompt?.trim?.()}
              loading={isLoading}
              onClick={handleQuery}
              type="primary"
            >
              Run Query
            </Button>
            {isLoading && (
              <Button danger onClick={abort}>
                Stop
              </Button>
            )}
          </Space>

          <Flexbox flex={1} style={{ overflow: 'auto' }}>
            {messages.length > 0 ? (
              <List dataSource={messages} renderItem={renderMessage} />
            ) : (
              <Center height="100%">
                <Empty description="No messages yet" />
              </Center>
            )}
          </Flexbox>
        </Flexbox>
      ),
      key: 'query',
      label: 'Query',
    },
    {
      children: (
        <Flexbox gap={16} height="100%">
          <Flexbox align="center" horizontal justify="space-between">
            <Text as={'h5'}>Recent Sessions</Text>
            <Button onClick={fetchRecentSessions} size="small">
              Refresh
            </Button>
          </Flexbox>

          <List
            dataSource={recentSessions}
            renderItem={(session) => (
              <List.Item
                actions={[
                  <Button
                    danger
                    key="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSession(session.sessionId);
                    }}
                    size="small"
                  >
                    Delete
                  </Button>,
                ]}
                className={styles.sessionItem}
                onClick={() => handleContinueSession(session.sessionId)}
              >
                <List.Item.Meta
                  description={
                    <Space size="large">
                      <Text type="secondary">
                        Created: {new Date(session.createdAt).toLocaleString()}
                      </Text>
                      <Text type="secondary">Turns: {session.turnCount}</Text>
                      {session.totalCost && (
                        <Text type="secondary">Cost: ${session.totalCost.toFixed(4)}</Text>
                      )}
                    </Space>
                  }
                  title={
                    <Space>
                      <Text>{session.sessionId}</Text>
                      {session.sessionId === currentSessionId && <Tag color="blue">Current</Tag>}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Flexbox>
      ),
      key: 'sessions',
      label: `Sessions (${recentSessions.length})`,
    },
    {
      children: (
        <Flexbox gap={16}>
          <Card className={styles.statusCard} title="Claude Code Status">
            <Space direction="vertical">
              <Text>Version: {version}</Text>
              <Text>API Source: {apiKeySource}</Text>
              {currentSessionId && <Text>Current Session: {currentSessionId}</Text>}
            </Space>
          </Card>

          <Card title="Features">
            <List
              dataSource={[
                'Multi-turn conversations with context',
                'File reading and writing capabilities',
                'Code execution through bash commands',
                'Session management and continuation',
                'Real-time streaming responses',
                'Cost tracking per session',
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>✅ {item}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Flexbox>
      ),
      key: 'info',
      label: 'Info',
    },
  ];

  return (
    <Flexbox className={styles.container} gap={16}>
      <PageTitle title="Claude Code" />

      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={setActiveTab}
        style={{ height: '100%' }}
      />
    </Flexbox>
  );
});

export default Client;
