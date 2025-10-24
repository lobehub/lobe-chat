import { Button, Text, useTheme, useToast } from '@lobehub/ui-rn';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function IntegrationDemo() {
  const toast = useToast();
  const token = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  // 模拟表单验证和提交
  const handleFormSubmit = async () => {
    // 验证表单
    if (!formData.username.trim()) {
      toast.error('请输入用户名');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('请输入有效的邮箱地址');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('密码长度至少为6位');
      return;
    }

    // 显示加载状态
    toast.loading('正在创建账户...', 5000);

    try {
      // 模拟API调用
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 模拟随机成功/失败
          if (Math.random() > 0.3) {
            resolve('success');
          } else {
            reject(new Error('服务器繁忙，请稍后重试'));
          }
        }, 2000);
      });

      toast.success('账户创建成功！欢迎加入我们');

      // 清空表单
      setFormData({ email: '', password: '', username: '' });
    } catch (error: any) {
      toast.error(error.message || '创建账户失败');
    }
  };

  // 模拟购物车操作
  const handleAddToCart = (productName: string) => {
    toast.success(`${productName} 已添加到购物车`);
  };

  const handleRemoveFromCart = (productName: string) => {
    toast.info(`${productName} 已从购物车移除`);
  };

  // 模拟收藏操作
  const handleToggleFavorite = (itemName: string, isFavorite: boolean) => {
    if (isFavorite) {
      toast.success(`${itemName} 已添加到收藏`);
    } else {
      toast.info(`${itemName} 已取消收藏`);
    }
  };

  // 模拟设置保存
  const handleSaveSettings = () => {
    toast.loading('正在保存设置...', 1500);

    setTimeout(() => {
      toast.success('设置已保存');
    }, 1000);
  };

  // 模拟数据同步
  const handleDataSync = () => {
    const steps = [
      '正在连接服务器...',
      '正在同步用户数据...',
      '正在同步设置信息...',
      '正在验证数据完整性...',
    ];

    let currentStep = 0;

    const showNextStep = () => {
      if (currentStep < steps.length) {
        toast.loading(steps[currentStep], 1500);
        currentStep++;
        setTimeout(showNextStep, 1200);
      } else {
        toast.success('数据同步完成！');
      }
    };

    showNextStep();
  };

  // 模拟网络状态变化
  const simulateNetworkChange = () => {
    toast.error('网络连接已断开', 2000);

    setTimeout(() => {
      toast.info('正在尝试重新连接...', 2000);
    }, 2500);

    setTimeout(() => {
      toast.success('网络连接已恢复');
    }, 5000);
  };

  // 与Alert结合使用
  const handleDeleteWithConfirm = () => {
    Alert.alert('确认删除', '此操作不可撤销，确定要删除这个项目吗？', [
      {
        onPress: () => toast.info('已取消删除操作'),
        style: 'cancel',
        text: '取消',
      },
      {
        onPress: () => {
          toast.loading('正在删除...', 2000);
          setTimeout(() => {
            toast.success('删除成功');
          }, 1500);
        },
        style: 'destructive',
        text: '删除',
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    formSection: {
      borderRadius: 12,
      marginBottom: 32,
      padding: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    integrationTips: {
      borderRadius: 12,
      padding: 16,
    },
    section: {
      gap: 16,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      marginTop: 8,
    },
    textInput: {
      borderRadius: 8,
      borderWidth: 1,
      fontSize: 14,
      paddingBlock: 12,
      paddingInline: 12,
    },
    tipSection: {
      marginBottom: 16,
    },
    tipSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    tipText: {
      fontSize: 12,
      lineHeight: 18,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 16,
    },
  });

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.container, { backgroundColor: token.colorBgLayout }]}
    >
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>表单集成</Text>
        <View style={[styles.formSection, { backgroundColor: token.colorBgElevated }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: token.colorText }]}>用户名</Text>
            <TextInput
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              placeholder="请输入用户名"
              placeholderTextColor={token.colorTextPlaceholder}
              style={[
                styles.textInput,
                {
                  backgroundColor: token.colorFillTertiary,
                  borderColor: token.colorBorderSecondary,
                  color: token.colorText,
                },
              ]}
              value={formData.username}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: token.colorText }]}>邮箱</Text>
            <TextInput
              keyboardType="email-address"
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="请输入邮箱地址"
              placeholderTextColor={token.colorTextPlaceholder}
              style={[
                styles.textInput,
                {
                  backgroundColor: token.colorFillTertiary,
                  borderColor: token.colorBorderSecondary,
                  color: token.colorText,
                },
              ]}
              value={formData.email}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: token.colorText }]}>密码</Text>
            <TextInput
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="请输入密码（至少6位）"
              placeholderTextColor={token.colorTextPlaceholder}
              secureTextEntry
              style={[
                styles.textInput,
                {
                  backgroundColor: token.colorFillTertiary,
                  borderColor: token.colorBorderSecondary,
                  color: token.colorText,
                },
              ]}
              value={formData.password}
            />
          </View>

          <Button
            onPress={handleFormSubmit}
            style={{ backgroundColor: token.colorSuccess }}
            type="primary"
          >
            创建账户
          </Button>
        </View>

        <Text style={[styles.sectionTitle, { color: token.colorText }]}>电商场景</Text>
        <View style={styles.section}>
          <Button
            onPress={() => handleAddToCart('iPhone 15 Pro')}
            style={{ backgroundColor: token.colorWarning }}
            type="primary"
          >
            添加到购物车
          </Button>

          <Button onPress={() => handleRemoveFromCart('iPhone 15 Pro')} type="default">
            从购物车移除
          </Button>

          <Button
            onPress={() => handleToggleFavorite('MacBook Pro', true)}
            style={{ backgroundColor: token.colorError }}
            type="primary"
          >
            添加到收藏
          </Button>
        </View>

        <Text style={[styles.sectionTitle, { color: token.colorText }]}>系统操作</Text>
        <View style={styles.section}>
          <Button onPress={handleSaveSettings} type="primary">
            保存设置
          </Button>

          <Button onPress={handleDataSync} type="primary">
            数据同步
          </Button>

          <Button
            onPress={simulateNetworkChange}
            style={{ backgroundColor: token.colorWarning }}
            type="primary"
          >
            网络状态变化
          </Button>

          <Button
            onPress={handleDeleteWithConfirm}
            style={{ backgroundColor: token.colorError }}
            type="primary"
          >
            确认删除
          </Button>
        </View>

        <View style={[styles.integrationTips, { backgroundColor: token.colorBgElevated }]}>
          <Text style={[styles.tipsTitle, { color: token.colorText }]}>集成最佳实践</Text>

          <View style={styles.tipSection}>
            <Text style={[styles.tipSectionTitle, { color: token.colorText }]}>表单验证</Text>
            <Text style={[styles.tipText, { color: token.colorTextSecondary }]}>
              • 在表单提交前进行验证，及时显示错误提示{'\n'}•
              使用不同类型的Toast区分验证错误和提交状态{'\n'}• 成功提交后清空表单并显示成功提示
            </Text>
          </View>

          <View style={styles.tipSection}>
            <Text style={[styles.tipSectionTitle, { color: token.colorText }]}>异步操作</Text>
            <Text style={[styles.tipText, { color: token.colorTextSecondary }]}>
              • 长时间操作时显示加载状态{'\n'}• 操作完成后根据结果显示成功或失败提示{'\n'}•
              提供足够的上下文信息帮助用户理解状态
            </Text>
          </View>

          <View style={styles.tipSection}>
            <Text style={[styles.tipSectionTitle, { color: token.colorText }]}>用户体验</Text>
            <Text style={[styles.tipText, { color: token.colorTextSecondary }]}>
              • 避免过于频繁的提示，保持界面简洁{'\n'}• 重要操作使用确认对话框，然后用Toast显示结果
              {'\n'}• 网络状态变化等系统事件及时通知用户
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
