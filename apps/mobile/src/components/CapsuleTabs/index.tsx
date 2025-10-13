import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { FONT_SIZE_LARGE, FONT_SIZE_SMALL, FONT_SIZE_STANDARD } from '@/_const/common';
import Icon from '@/components/Icon';
import ScrollShadow from '@/components/ScrollShadow';
import Space from '@/components/Space';
import Text from '@/components/Text';

import { useStyles } from './style';
import { CapsuleTabsProps } from './type';

export const CapsuleTabs: React.FC<CapsuleTabsProps> = ({
  items,
  onSelect,
  selectedKey,
  size = 'middle',
  style,
  enableScrollShadow = true,
}) => {
  const { styles } = useStyles(size);
  const iconSize =
    size === 'large' ? FONT_SIZE_LARGE : size === 'small' ? FONT_SIZE_SMALL : FONT_SIZE_STANDARD;

  const renderContent = () => (
    <ScrollView
      contentContainerStyle={styles.container}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
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
                <View testID={`capsule-tab-icon-${item.key}`}>
                  <Icon color={iconColor} icon={item.icon} size={iconSize} />
                </View>
              ) : null}
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{item.label}</Text>
            </Space>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  if (enableScrollShadow) {
    return (
      <View style={[styles.wrapper, style]}>
        <ScrollShadow hideScrollBar orientation="horizontal" size={20}>
          {renderContent()}
        </ScrollShadow>
      </View>
    );
  }

  return <View style={[styles.wrapper, style]}>{renderContent()}</View>;
};

export default CapsuleTabs;
export * from './type';
