import {
  CapsuleTabItem,
  CapsuleTabs,
  Cell,
  Flexbox,
  Text,
  useTheme,
  useThemeMode,
} from '@lobehub/ui-rn';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack, useRouter } from 'expo-router';
import { kebabCase } from 'lodash-es';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';

import { isIOS } from '@/utils/detection';

import { ComponentItem } from './type';
import { getAllCategories, getAllComponents, searchComponentsByName } from './utils';

export default function ComponentPlaygroundIndex() {
  const { isDarkMode } = useThemeMode();
  const theme = useTheme();
  const isGlassAvailable = isLiquidGlassAvailable();
  const blurEffect = isDarkMode ? 'systemMaterialDark' : 'systemMaterialLight';
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = getAllCategories();

  // 构建 CapsuleTabs 的数据
  const tabItems: CapsuleTabItem[] = [
    { key: '', label: 'All' },
    ...categories.map((category) => ({ key: category, label: category })),
  ];

  // 获取分组后的组件
  const groupedComponents = useMemo(() => {
    let components = getAllComponents();

    // 应用搜索过滤
    if (searchText) {
      components = searchComponentsByName(searchText);
    }

    // 应用分类过滤
    if (selectedCategory) {
      components = components.filter((c) => c.category === selectedCategory);
    }

    // 重新按 group 分组
    const filtered: Record<string, ComponentItem[]> = {};
    components.forEach((component) => {
      if (!filtered[component.category]) {
        filtered[component.category] = [];
      }
      filtered[component.category].push(component);
    });

    // 按照原始 groups 顺序返回
    const orderedGroups: Record<string, ComponentItem[]> = {};
    getAllCategories().forEach((group) => {
      if (filtered[group] && filtered[group].length > 0) {
        orderedGroups[group] = filtered[group];
      }
    });

    return orderedGroups;
  }, [searchText, selectedCategory]);

  const handleComponentPress = (component: ComponentItem) => {
    // 使用 kebabCase 自动将组件名转换为路径
    const componentPath = kebabCase(component.name);
    router.push(`/playground/${componentPath}` as any);
  };

  const renderComponentCard = (component: ComponentItem) => (
    <Cell
      key={component.name}
      onPress={() => handleComponentPress(component)}
      title={component.name}
    />
  );

  const renderGroupSection = (group: string, components: ComponentItem[]) => (
    <Flexbox key={group}>
      <Flexbox paddingBlock={4} paddingInline={16}>
        <Text strong type={'secondary'}>
          {group.toUpperCase()}
        </Text>
      </Flexbox>
      <Flexbox>{components.map(renderComponentCard)}</Flexbox>
    </Flexbox>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerBackButtonDisplayMode: 'minimal',
          headerBackButtonMenuEnabled: true,
          headerBackVisible: true,
          headerBlurEffect: isGlassAvailable ? undefined : blurEffect,
          headerLargeStyle: {
            backgroundColor: !isGlassAvailable ? theme.colorBgLayout : 'transparent',
          },
          headerLargeTitle: isIOS,
          headerSearchBarOptions: {
            cancelButtonText: '取消',
            onChangeText: (event) => {
              setSearchText(event.nativeEvent.text);
            },
            placeholder: '搜索组件...',
            textColor: theme.colorText,
          },
          headerShown: true,
          headerStyle: { backgroundColor: !isGlassAvailable ? theme.colorBgLayout : 'transparent' },
          headerTintColor: theme.colorText,
          headerTransparent: isIOS,
          title: 'Playground',
        }}
      />
      <ScrollView
        automaticallyAdjustContentInsets={true}
        contentInsetAdjustmentBehavior={'automatic'}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <Flexbox padding={16}>
          <CapsuleTabs
            items={tabItems}
            onSelect={setSelectedCategory}
            selectedKey={selectedCategory}
          />
        </Flexbox>
        <Flexbox gap={32}>
          {Object.entries(groupedComponents).map(([group, components]) =>
            renderGroupSection(group, components),
          )}
        </Flexbox>
      </ScrollView>
    </>
  );
}
