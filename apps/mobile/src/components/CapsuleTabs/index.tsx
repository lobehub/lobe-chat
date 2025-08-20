import React from 'react';
import { ScrollView, TouchableOpacity, Text, ViewStyle, StyleProp } from 'react-native';
import { useStyles } from './style';

export interface CapsuleTabItem {
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
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          onPress={() => onSelect(item.key)}
          style={[styles.tab, selectedKey === item.key && styles.tabActive]}
        >
          <Text style={[styles.tabText, selectedKey === item.key && styles.tabTextActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CapsuleTabs;
