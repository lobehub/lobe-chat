import { Button, Flexbox, Text, useTheme, useToast } from '@lobehub/ui-rn';
import { ScrollView, StyleSheet } from 'react-native';

export default function BasicDemo() {
  const token = useTheme();
  const toast = useToast();

  const showSuccess = () => {
    toast.success('操作成功');
  };

  const showError = () => {
    toast.error('操作失败，请检查您的网络连接并重试');
  };

  const showWarning = () => {
    toast.warning('注意：此操作将会覆盖现有数据');
  };

  const showInfo = () => {
    toast.info('您有新的系统更新可用');
  };

  const showLoading = () => {
    toast.loading('加载中...', 3000);
  };

  const showMultiple = () => {
    toast.success('第一个 Toast');
    setTimeout(() => toast.info('第二个 Toast'), 200);
    setTimeout(() => toast.warning('第三个 Toast'), 400);
  };

  const showLongContent = () => {
    toast.success(
      '这是一个非常长的标题用于测试文本截断功能，当文本内容超出显示区域时，应该能够正确地进行截断或者换行显示。',
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: token.colorBgLayout }]}>
      <Flexbox style={styles.section}>
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>基础类型</Text>
        <Flexbox gap={8}>
          <Button
            onPress={showSuccess}
            style={{ backgroundColor: token.colorSuccess }}
            type="primary"
          >
            成功提示
          </Button>
          <Button onPress={showError} style={{ backgroundColor: token.colorError }} type="primary">
            错误提示
          </Button>
          <Button
            onPress={showWarning}
            style={{ backgroundColor: token.colorWarning }}
            type="primary"
          >
            警告提示
          </Button>
          <Button onPress={showInfo} type="primary">
            信息提示
          </Button>
          <Button onPress={showLoading} type="default">
            加载提示
          </Button>
        </Flexbox>
      </Flexbox>

      <Flexbox style={styles.section}>
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>堆叠效果</Text>
        <Flexbox gap={8}>
          <Button onPress={showMultiple} type="primary">
            显示多个 Toast（堆叠效果）
          </Button>
          <Button onPress={showLongContent} type="default">
            长内容测试
          </Button>
        </Flexbox>
      </Flexbox>
    </ScrollView>
  );
}
