import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Space } from '@/components';
import Icon from '@/components/Icon';
import { FONT_SIZE_LARGE, FONT_SIZE_SMALL, FONT_SIZE_STANDARD } from '@/const/common';

import { useStyles } from './style';
import { CapsuleTabsProps } from './type';

export const CapsuleTabs: React.FC<CapsuleTabsProps> = ({
  items,
  selectedKey,
  onSelect,
  showsHorizontalScrollIndicator = false,
  size = 'middle',
  style,
}) => {
  const { styles } = useStyles(size);
  const iconSize =
    size === 'large' ? FONT_SIZE_LARGE : size === 'small' ? FONT_SIZE_SMALL : FONT_SIZE_STANDARD;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      style={[styles.container, style]}
    >
      {items.map((item) => {
        const isActive = selectedKey === item.key;
        const iconColor = StyleSheet.flatten(
          isActive ? styles.tabTextActive : styles.tabText,
        )?.color;

        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => onSelect(item.key)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Space>
              {item.icon ? <Icon color={iconColor} icon={item.icon} size={iconSize} /> : null}
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{item.label}</Text>
            </Space>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default CapsuleTabs;
export * from './type';
