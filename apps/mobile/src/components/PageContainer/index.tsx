import { ActionIcon } from '@lobehub/ui-rn';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { ReactNode } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStyles } from './style';

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
        <View style={styles.title}>
          {typeof title === 'string' ? (
            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.titleText}>
              {title}
            </Text>
          ) : (
            title
          )}
        </View>
        <View style={styles.extra}>{extra}</View>
      </View>
      {children}
    </SafeAreaView>
  );
};

export default PageContainer;
