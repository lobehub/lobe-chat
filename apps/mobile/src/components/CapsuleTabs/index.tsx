import React from 'react';
import { ScrollView, TouchableOpacity, Text, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { useStyles } from './style';
import Icon, { type IconRenderable } from '@/components/Icon';
import { FONT_SIZE_STANDARD } from '@/const/common';
import { Space } from '@/components';

export interface CapsuleTabItem {
  icon?: IconRenderable;
  key: string;
  label: string;
}

export interface CapsuleTabsProps {
  items: CapsuleTabItem[];
  onSelect: (key: string) => void;
  selectedKey: string;
  showsHorizontalScrollIndicator?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const CapsuleTabs: React.FC<CapsuleTabsProps> = ({
  items,
  selectedKey,
  onSelect,
  showsHorizontalScrollIndicator = false,
  style,
}) => {
  const { styles } = useStyles();

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
              {item.icon ? (
                <Icon color={iconColor} icon={item.icon} size={FONT_SIZE_STANDARD} />
              ) : null}
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{item.label}</Text>
            </Space>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default CapsuleTabs;
