import { memo, useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';

import { TabViewProps } from './type';

const TabView = memo<TabViewProps>(({ onChange, value, defaultValue, items, lazy }) => {
  const containerRef = useRef<any>(null);

  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current?.jumpToTab(value);
  }, [value]);

  return (
    <Tabs.Container
      initialTabName={defaultValue || items[0].key}
      lazy
      onTabChange={(activeTab) => onChange?.(activeTab.tabName)}
      ref={containerRef}
      renderTabBar={() => null}
      width={width}
    >
      {items.map((item) => {
        const content = (
          <Tabs.ScrollView showsVerticalScrollIndicator={false}>{item.children}</Tabs.ScrollView>
        );
        return (
          <Tabs.Tab key={item.key} name={item.key}>
            {item.lazy === false ? content : lazy ? <Tabs.Lazy>{content}</Tabs.Lazy> : content}
          </Tabs.Tab>
        );
      })}
    </Tabs.Container>
  );
});

TabView.displayName = 'TabView';

export default TabView;
