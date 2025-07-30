import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import dayjs from 'dayjs';

import { useThemeToken } from '@/mobile/theme/context';

import { useToast } from '../ToastProvider';
import { DemoButton } from './DemoButton';

export default function AdvancedDemo() {
  const toast = useToast();
  const token = useThemeToken();
  const [autoHide, setAutoHide] = useState(true);
  const [longMessages, setLongMessages] = useState(false);

  const simulateApiCall = async () => {
    toast.loading('正在发送请求...', 10_000);

    // 模拟网络延迟
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    // 随机成功或失败
    if (Math.random() > 0.3) {
      toast.success('API调用成功！');
    } else {
      toast.error('网络错误，请检查连接后重试');
    }
  };

  const simulateFileUpload = async () => {
    const steps = [
      { duration: 1000, message: '正在检查文件...' },
      { duration: 1500, message: '正在压缩文件...' },
      { duration: 2000, message: '正在上传文件...' },
      { duration: 1000, message: '正在验证文件...' },
    ];

    for (const step of steps) {
      toast.loading(step.message, step.duration + 500);
      await new Promise((resolve) => {
        setTimeout(resolve, step.duration);
      });
    }

    toast.success('文件上传完成！');
  };

  const showProgressiveFeedback = () => {
    toast.info('开始数据处理...');

    setTimeout(() => {
      toast.info('正在分析数据结构...');
    }, 1000);

    setTimeout(() => {
      toast.info('正在验证数据完整性...');
    }, 2500);

    setTimeout(() => {
      toast.loading('正在保存数据...', 2000);
    }, 4000);

    setTimeout(() => {
      toast.success('数据处理完成！');
    }, 5500);
  };

  const showConditionalToasts = () => {
    const duration = autoHide ? 2000 : 10_000;
    const messageLength = longMessages ? '长' : '短';

    if (longMessages) {
      toast.info(
        `这是一条很长的消息，用来测试Toast组件在显示长文本时的表现。当消息内容较多时，Toast会自动换行显示，确保所有信息都能被用户看到。自动隐藏：${autoHide ? '开启' : '关闭'}`,
        duration,
      );
    } else {
      toast.info(`${messageLength}消息测试 (自动隐藏: ${autoHide ? '开启' : '关闭'})`, duration);
    }
  };

  const showErrorWithDetails = () => {
    const errors = [
      '用户认证失败：令牌已过期',
      '文件上传失败：文件大小超过10MB限制',
      '数据库连接失败：无法连接到服务器',
      '权限不足：您没有执行此操作的权限',
      '网络超时：请求在30秒内未收到响应',
    ];

    const randomError = errors[Math.floor(Math.random() * errors.length)];
    toast.error(randomError, 4000);
  };

  const showTimestampedMessages = () => {
    const timestamp = dayjs().format('HH:mm:ss');

    toast.info(`消息发送时间：${timestamp}`);

    setTimeout(() => {
      const newTime = dayjs().format('HH:mm:ss');
      toast.success(`处理完成时间：${newTime}`);
    }, 2000);
  };

  const styles = StyleSheet.create({
    configDesc: {
      color: token.colorTextSecondary,
      fontSize: 12,
    },
    configItem: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    configLabel: {
      color: token.colorText,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    configSection: {
      backgroundColor: token.colorBgElevated,
      borderRadius: 12,
      marginBottom: 32,
      padding: 16,
    },
    configText: {
      flex: 1,
    },
    container: {
      backgroundColor: token.colorBgLayout,
      flex: 1,
    },
    content: {
      padding: 16,
    },
    section: {
      gap: 16,
      marginBottom: 32,
    },
    sectionTitle: {
      color: token.colorText,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      marginTop: 8,
    },
    tipDesc: {
      color: token.colorTextSecondary,
      fontSize: 12,
      lineHeight: 18,
      marginLeft: 12,
    },
    tipItem: {
      marginBottom: 16,
    },
    tipLabel: {
      color: token.colorText,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    tips: {
      backgroundColor: token.colorBgElevated,
      borderRadius: 12,
      padding: 16,
    },
    tipsTitle: {
      color: token.colorText,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 16,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>高级场景</Text>
        <View style={styles.section}>
          <DemoButton
            description="完整的异步操作流程演示"
            onPress={simulateApiCall}
            title="模拟API调用"
            variant="success"
          />

          <DemoButton
            description="多步骤操作的进度提示"
            onPress={simulateFileUpload}
            title="文件上传流程"
            variant="primary"
          />

          <DemoButton
            description="连续的状态更新提示"
            onPress={showProgressiveFeedback}
            title="渐进式反馈"
            variant="primary"
          />

          <DemoButton
            description="显示具体的错误描述"
            onPress={showErrorWithDetails}
            title="详细错误信息"
            variant="error"
          />

          <DemoButton
            description="包含时间信息的提示"
            onPress={showTimestampedMessages}
            title="时间戳消息"
            variant="warning"
          />
        </View>

        <Text style={styles.sectionTitle}>配置选项</Text>
        <View style={styles.configSection}>
          <View style={styles.configItem}>
            <View style={styles.configText}>
              <Text style={styles.configLabel}>自动隐藏</Text>
              <Text style={styles.configDesc}>{autoHide ? '2秒后自动消失' : '10秒后自动消失'}</Text>
            </View>
            <Switch
              onValueChange={setAutoHide}
              thumbColor={autoHide ? token.colorWhite : token.colorTextTertiary}
              trackColor={{ false: token.colorBorderSecondary, true: token.colorSuccess }}
              value={autoHide}
            />
          </View>

          <View style={styles.configItem}>
            <View style={styles.configText}>
              <Text style={styles.configLabel}>长消息模式</Text>
              <Text style={styles.configDesc}>
                {longMessages ? '显示详细消息内容' : '显示简短消息内容'}
              </Text>
            </View>
            <Switch
              onValueChange={setLongMessages}
              thumbColor={longMessages ? token.colorWhite : token.colorTextTertiary}
              trackColor={{ false: token.colorBorderSecondary, true: token.colorSuccess }}
              value={longMessages}
            />
          </View>

          <DemoButton
            description="使用当前配置显示Toast"
            onPress={showConditionalToasts}
            title="测试当前配置"
            variant="secondary"
          />
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>高级用法提示</Text>

          <View style={styles.tipItem}>
            <Text style={styles.tipLabel}>• 异步操作反馈</Text>
            <Text style={styles.tipDesc}>
              在进行网络请求或文件操作时，使用loading类型显示进度，
              完成后根据结果显示成功或错误提示。
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipLabel}>• 错误信息设计</Text>
            <Text style={styles.tipDesc}>
              错误提示应该包含具体的错误原因和可能的解决方案， 帮助用户理解问题并采取相应的行动。
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipLabel}>• 持续时间策略</Text>
            <Text style={styles.tipDesc}>
              根据消息的重要性和内容长度调整显示时间： 成功提示短一些，错误信息长一些。
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipLabel}>• 用户体验考量</Text>
            <Text style={styles.tipDesc}>
              避免过于频繁的提示，在批量操作时考虑合并相似的消息， 保持界面简洁且信息有效。
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
