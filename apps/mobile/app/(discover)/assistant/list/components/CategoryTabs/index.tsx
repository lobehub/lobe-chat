import React from 'react';
import { ScrollView, TouchableOpacity, Text, ViewStyle, StyleProp, View } from 'react-native';
import { useStyles } from './style';

export interface CategoryTabItem {
  count?: number;
  icon?: React.ComponentType<any>;
  key: string;
  label: string;
}

export interface CategoryTabsProps {
  items: CategoryTabItem[];
  onSelect: (key: string) => void;
  selectedKey: string;
  showsHorizontalScrollIndicator?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = React.memo(
  ({ items, selectedKey, onSelect, showsHorizontalScrollIndicator = false, style }) => {
    const { styles, token } = useStyles();

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        style={[styles.container, style]}
      >
        {items.map((item) => {
          const isActive = selectedKey === item.key;
          const IconComponent = item.icon;

          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onSelect(item.key)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <View style={styles.tabContent}>
                {IconComponent && (
                  <IconComponent
                    color={isActive ? token.colorTextLightSolid : token.colorTextSecondary}
                    size={16}
                  />
                )}
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{item.label}</Text>
                {item.count !== undefined && item.count > 0 && (
                  <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                    <Text style={[styles.countText, isActive && styles.countTextActive]}>
                      {item.count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.selectedKey === nextProps.selectedKey &&
      prevProps.showsHorizontalScrollIndicator === nextProps.showsHorizontalScrollIndicator &&
      prevProps.items.length === nextProps.items.length &&
      prevProps.items.every((item, index) => {
        const nextItem = nextProps.items[index];
        return (
          item.key === nextItem.key &&
          item.label === nextItem.label &&
          item.count === nextItem.count
        );
      })
    );
  },
);

export default CategoryTabs;
