import { Button, Flexbox, Text, useTheme, useToast } from '@lobehub/ui-rn';
import { ScrollView, StyleSheet } from 'react-native';

export default function PositionDemo() {
  const token = useTheme();
  const toast = useToast();

  const showTopSuccess = () => {
    toast.show({ message: '顶部成功提示', position: 'top', type: 'success' });
  };

  const showBottomSuccess = () => {
    toast.show({ message: '底部成功提示', position: 'bottom', type: 'success' });
  };

  const showMultipleTop = () => {
    toast.show({ message: '顶部第一个', position: 'top', type: 'info' });
    setTimeout(() => toast.show({ message: '顶部第二个', position: 'top', type: 'success' }), 200);
    setTimeout(() => toast.show({ message: '顶部第三个', position: 'top', type: 'warning' }), 400);
  };

  const showMultipleBottom = () => {
    toast.show({ message: '底部第一个', position: 'bottom', type: 'info' });
    setTimeout(
      () => toast.show({ message: '底部第二个', position: 'bottom', type: 'success' }),
      200,
    );
    setTimeout(
      () => toast.show({ message: '底部第三个', position: 'bottom', type: 'warning' }),
      400,
    );
  };

  const showBoth = () => {
    toast.show({ message: '顶部提示', position: 'top', type: 'info' });
    toast.show({ message: '底部提示', position: 'bottom', type: 'success' });
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
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>顶部位置</Text>
        <Flexbox gap={8}>
          <Button onPress={showTopSuccess} type="primary">
            顶部单个 Toast
          </Button>
          <Button onPress={showMultipleTop} type="default">
            顶部多个 Toast（堆叠）
          </Button>
        </Flexbox>
      </Flexbox>

      <Flexbox style={styles.section}>
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>底部位置</Text>
        <Flexbox gap={8}>
          <Button onPress={showBottomSuccess} type="primary">
            底部单个 Toast
          </Button>
          <Button onPress={showMultipleBottom} type="default">
            底部多个 Toast（堆叠）
          </Button>
        </Flexbox>
      </Flexbox>

      <Flexbox style={styles.section}>
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>组合测试</Text>
        <Flexbox gap={8}>
          <Button onPress={showBoth} type="primary">
            同时显示顶部和底部
          </Button>
        </Flexbox>
      </Flexbox>
    </ScrollView>
  );
}
