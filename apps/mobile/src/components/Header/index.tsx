import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { ActionIcon } from '@/components';

import { useStyles } from './style';
import { router } from 'expo-router';

interface HeaderProps {
  left?: ReactNode;
  right?: ReactNode;
  showBack?: boolean;
  title?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title = '', left, right, showBack }) => {
  const { styles } = useStyles();

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
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
        <View style={styles.right}>{right}</View>
      </View>
    </SafeAreaView>
  );
};

export default Header;
