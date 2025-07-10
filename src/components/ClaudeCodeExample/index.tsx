import { ClaudeCodeMessage } from '@lobechat/electron-client-ipc';
import { Button, Card, Input, List, Space, Typography, message } from 'antd';
import React, { useState } from 'react';

import { useClaudeCode } from '@/hooks/useClaudeCode';

const { TextArea } = Input;
const { Text, Title } = Typography;

export const ClaudeCodeExample: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ClaudeCodeMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  const {
    isAvailable,
    isLoading,
    error,
    apiKeySource,
    version,
    recentSessions,
    query,
    startStreamingQuery,
    stopStreaming,
    abort,
    fetchRecentSessions,
    clearSession,
  } = useClaudeCode({
    onStreamComplete: (sessionId) => {
      setCurrentSessionId(sessionId);
      message.success(`Stream completed. Session ID: ${sessionId}`);
      fetchRecentSessions();
    },
    onStreamError: (err) => {
      message.error(`Stream error: ${err}`);
    },
    onStreamMessage: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
  });

  // 执行普通查询
  const handleQuery = async () => {
    if (!prompt.trim()) {
      message.warning('请输入提示词');
      return;
    }

    try {
      setMessages([]);
      const result = await query(prompt, {
        maxTurns: 3,
        outputFormat: 'json',
      });

      setMessages(result.messages);
      setCurrentSessionId(result.sessionId);
      fetchRecentSessions();
    } catch (err) {
      message.error(`查询失败: ${err.message}`);
    }
  };

  // 执行流式查询
  const handleStreamQuery = async () => {
    if (!prompt.trim()) {
      message.warning('请输入提示词');
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
      message.error(`流式查询失败: ${err.message}`);
    }
  };

  // 继续上一个会话
  const handleContinueSession = async (sessionId: string) => {
    try {
      setMessages([]);
      await startStreamingQuery(prompt || 'Continue', {
        outputFormat: 'stream-json',
        resumeSessionId: sessionId,
      });
    } catch (err) {
      message.error(`继续会话失败: ${err.message}`);
    }
  };

  if (!isAvailable) {
    return (
      <Card>
        <Title level={4}>Claude Code 不可用</Title>
        {error && <Text type="danger">{error}</Text>}
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 状态信息 */}
        <Card title="Claude Code 状态">
          <Space direction="vertical">
            <Text>版本: {version}</Text>
            <Text>API 来源: {apiKeySource}</Text>
            {currentSessionId && <Text>当前会话: {currentSessionId}</Text>}
          </Space>
        </Card>

        {/* 输入区域 */}
        <Card title="输入提示词">
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              disabled={isLoading}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入你的提示词..."
              rows={4}
              value={prompt}
            />
            <Space>
              <Button loading={isLoading} onClick={handleQuery} type="primary">
                执行查询
              </Button>
              <Button loading={isLoading} onClick={handleStreamQuery}>
                流式查询
              </Button>
              {isLoading && (
                <Button danger onClick={abort}>
                  停止
                </Button>
              )}
            </Space>
          </Space>
        </Card>

        {/* 消息列表 */}
        {messages.length > 0 && (
          <Card title="消息记录">
            <List
              dataSource={messages}
              renderItem={(msg, index) => (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>
                      [{index + 1}] {msg.type}
                      {msg.subtype && ` - ${msg.subtype}`}
                    </Text>
                    {msg.type === 'result' && (
                      <Space direction="vertical">
                        <Text>耗时: {msg.duration_ms}ms</Text>
                        <Text>API 耗时: {msg.duration_api_ms}ms</Text>
                        <Text>回合数: {msg.num_turns}</Text>
                        {msg.total_cost_usd && <Text>费用: ${msg.total_cost_usd}</Text>}
                        {msg.result && <Text>{msg.result}</Text>}
                      </Space>
                    )}
                    {msg.type === 'system' && msg.subtype === 'init' && (
                      <Space direction="vertical">
                        <Text>工作目录: {msg.cwd}</Text>
                        <Text>模型: {msg.model}</Text>
                        <Text>权限模式: {msg.permissionMode}</Text>
                        <Text>可用工具: {msg.tools?.join(', ')}</Text>
                      </Space>
                    )}
                    {msg.message && (
                      <pre style={{ background: '#f5f5f5', borderRadius: 4, padding: 8 }}>
                        {JSON.stringify(msg.message, null, 2)}
                      </pre>
                    )}
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* 最近会话 */}
        <Card
          extra={
            <Button onClick={fetchRecentSessions} size="small">
              刷新
            </Button>
          }
          title="最近会话"
        >
          <List
            dataSource={recentSessions}
            renderItem={(session) => (
              <List.Item
                actions={[
                  <Button
                    key="continue"
                    onClick={() => handleContinueSession(session.sessionId)}
                    size="small"
                  >
                    继续
                  </Button>,
                  <Button
                    danger
                    key="clear"
                    onClick={() => clearSession(session.sessionId)}
                    size="small"
                  >
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  description={
                    <Space direction="vertical">
                      <Text>创建时间: {new Date(session.createdAt).toLocaleString()}</Text>
                      <Text>最后活跃: {new Date(session.lastActiveAt).toLocaleString()}</Text>
                      <Text>回合数: {session.turnCount}</Text>
                      {session.totalCost && <Text>总费用: ${session.totalCost.toFixed(4)}</Text>}
                    </Space>
                  }
                  title={session.sessionId}
                />
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </div>
  );
};
