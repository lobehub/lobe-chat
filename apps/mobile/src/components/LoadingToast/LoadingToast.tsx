import { Loader2Icon } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Block from '../Block';
import Center from '../Center';
import Flexbox from '../Flexbox';
import Icon from '../Icon';
import { useTheme } from '../styles';
import { useStyles } from './style';
import type { LoadingToastProps } from './type';

const LoadingToast = memo<LoadingToastProps>(() => {
  const token = useTheme();
  const { styles } = useStyles();

  return (
    <Flexbox style={styles.overlay}>
      {/* 背景遮罩 - 禁用点击 */}
      <Pressable onPress={(e) => e.preventDefault()} style={styles.background}>
        <View style={[StyleSheet.absoluteFillObject]} />
      </Pressable>

      {/* Toast 内容区 */}
      <Center>
        <Block
          align={'center'}
          blur
          borderRadius={32}
          gap={16}
          justify={'center'}
          padding={16}
          shadow
          style={styles.toastContainer}
          variant="filled"
        >
          <Icon color={token.colorTextDescription} icon={Loader2Icon} size={48} spin />
        </Block>
      </Center>
    </Flexbox>
  );
});

LoadingToast.displayName = 'LoadingToast';

export default LoadingToast;
