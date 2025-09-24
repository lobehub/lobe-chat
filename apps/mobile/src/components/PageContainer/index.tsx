import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStyles } from './style';
import { router } from 'expo-router';
import ActionIcon from '@/components/ActionIcon';
import { ChevronLeft } from 'lucide-react-native';

export interface PageContainerProps {
  children?: ReactNode;
  extra?: ReactNode;
  left?: ReactNode;
  showBack?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  style,
  left = undefined,
  showBack = false,
  title = '',
  extra = undefined,
}) => {
  const { styles } = useStyles();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.left}>
          {left !== undefined ? (
            left
          ) : showBack ? (
            <ActionIcon icon={ChevronLeft} onPress={() => router.back()} />
          ) : null}
        </View>
        <Text ellipsizeMode="tail" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <View style={styles.extra}>{extra}</View>
      </View>
      {children}
    </SafeAreaView>
  );
};

export default PageContainer;
