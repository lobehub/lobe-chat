import { memo, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView } from 'react-native';

import Flexbox from '@/components/Flexbox';
import Icon from '@/components/Icon';
import ScrollShadow from '@/components/ScrollShadow';
import Text from '@/components/Text';

import { useStyles } from './style';
import { CapsuleTabsProps } from './type';

interface TabLayout {
  width: number;
  x: number;
}

export const CapsuleTabs = memo<CapsuleTabsProps>(
  ({ items, onSelect, selectedKey, size = 'middle', style, enableScrollShadow = true }) => {
    const { styles, theme } = useStyles(size);

    // 存储每个 tab 的布局信息
    const [tabLayouts, setTabLayouts] = useState<Map<string, TabLayout>>(new Map());
    // 指示器动画值
    const indicatorLeft = useRef(new Animated.Value(0)).current;
    const indicatorWidth = useRef(new Animated.Value(0)).current;

    // 当选中的 tab 改变时，动画移动指示器
    useEffect(() => {
      const targetLayout = tabLayouts.get(selectedKey);
      if (targetLayout) {
        Animated.parallel([
          Animated.spring(indicatorLeft, {
            friction: 10,
            tension: 100,
            toValue: targetLayout.x,
            useNativeDriver: false,
          }),
          Animated.spring(indicatorWidth, {
            friction: 10,
            tension: 100,
            toValue: targetLayout.width,
            useNativeDriver: false,
          }),
        ]).start();
      }
    }, [selectedKey, tabLayouts, indicatorLeft, indicatorWidth]);

    const handleTabLayout = (key: string, event: any) => {
      const { x, width } = event.nativeEvent.layout;
      setTabLayouts((prev) => {
        const newLayouts = new Map(prev);
        newLayouts.set(key, { width, x });
        return newLayouts;
      });
    };

    const renderContent = () => (
      <>
        <ScrollView
          contentContainerStyle={styles.container}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {items.map((item) => {
            const isActive = selectedKey === item.key;

            return (
              <Flexbox
                align={'center'}
                gap={styles.tabText.fontSize / 2}
                horizontal
                key={item.key}
                onLayout={(e) => handleTabLayout(item.key, e)}
                onPress={() => onSelect(item.key)}
                style={styles.tab}
              >
                {item.icon ? (
                  <Icon
                    color={isActive ? undefined : theme.colorTextDescription}
                    icon={item.icon}
                    size={styles.tabText.fontSize}
                  />
                ) : null}
                <Text
                  color={isActive ? undefined : theme.colorTextDescription}
                  style={styles.tabText}
                  weight={500}
                >
                  {item.label}
                </Text>
              </Flexbox>
            );
          })}
        </ScrollView>
        {/* 底部指示器 */}
        <Animated.View
          style={[
            styles.indicator,
            {
              left: indicatorLeft,
              width: indicatorWidth,
            },
          ]}
        />
      </>
    );

    if (enableScrollShadow) {
      return (
        <ScrollShadow
          hideScrollBar
          orientation="horizontal"
          size={6}
          style={style}
          testID="capsule-tabs"
        >
          {renderContent()}
        </ScrollShadow>
      );
    }

    return (
      <Flexbox align={'center'} horizontal style={style} testID="capsule-tabs">
        {renderContent()}
      </Flexbox>
    );
  },
);

CapsuleTabs.displayName = 'CapsuleTabs';

export default CapsuleTabs;
