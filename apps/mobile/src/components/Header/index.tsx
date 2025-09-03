import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NavigateBack from '../NavigateBack';
import { useStyles } from './style';

interface HeaderProps {
  left?: ReactNode;
  right?: ReactNode;
  showBack?: boolean;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = '', left, right, showBack }) => {
  const { styles } = useStyles();

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left}>
          {left !== undefined ? left : showBack ? <NavigateBack /> : null}
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
