/**
 * Agent Store 测试组件
 * 用于验证 Agent Store 功能是否正常
 */

import React from 'react';
import { View, Text, Button, ScrollView } from 'react-native';

import { useCurrentAgent } from '@/hooks/useCurrentAgent';
import { useEnabledChatModels } from '@/hooks/useEnabledChatModels';

export const AgentStoreTest: React.FC = () => {
  const { currentModel, currentProvider, currentSystemRole, updateAgentConfig } = useCurrentAgent();

  // 获取可用模型列表
  const enabledModels = useEnabledChatModels();

  // 测试功能
  const handleTestGPT4 = async () => {
    await updateAgentConfig({
      model: 'gpt-4',
      provider: 'openai',
    });
  };

  const handleTestClaude = async () => {
    await updateAgentConfig({
      model: 'claude-3-sonnet',
      provider: 'anthropic',
    });
  };

  const handleTestSystemRole = async () => {
    await updateAgentConfig({
      systemRole: '你是一个专业的移动端开发助手，擅长React Native开发。',
    });
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Agent Store 功能测试
      </Text>

      {/* 当前配置 */}
      <View style={{ backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 16, padding: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>当前Agent配置：</Text>
        <Text>模型: {currentModel}</Text>
        <Text>提供商: {currentProvider}</Text>
        <Text>系统角色: {currentSystemRole || '无'}</Text>
      </View>

      {/* 测试按钮 */}
      <View style={{ gap: 12, marginBottom: 16 }}>
        <Button onPress={handleTestGPT4} title="测试切换到 GPT-4" />
        <Button onPress={handleTestClaude} title="测试切换到 Claude-3" />
        <Button onPress={handleTestSystemRole} title="测试更新系统角色" />
      </View>

      {/* 可用模型列表 */}
      <View>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>可用模型列表：</Text>
        {enabledModels.map((provider) => (
          <View key={provider.id} style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{provider.name}:</Text>
            {provider.children.map((model) => (
              <Text key={model.id} style={{ marginLeft: 16 }}>
                • {model.displayName || model.id}
              </Text>
            ))}
          </View>
        ))}
      </View>

      {/* Debug信息 */}
      <View style={{ backgroundColor: '#f9f9f9', borderRadius: 8, marginTop: 24, padding: 12 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Debug信息：</Text>
        <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>
          Available models: {enabledModels.length} providers
        </Text>
        <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>
          Current config loaded: {currentModel ? 'Yes' : 'No'}
        </Text>
      </View>
    </ScrollView>
  );
};
