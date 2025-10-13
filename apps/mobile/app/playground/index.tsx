import {
  CapsuleTabItem,
  CapsuleTabs,
  Divider,
  Flexbox,
  Input,
  PageContainer,
  Text,
} from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { kebabCase } from 'lodash-es';
import React, { Fragment, useMemo, useState } from 'react';
import { View } from 'react-native';

import { useStyles } from './styles';
import { ComponentItem } from './type';
import { getAllCategories, getAllComponents, searchComponentsByName } from './utils';

export default function ComponentPlaygroundIndex() {
  const router = useRouter();
  const { styles } = useStyles();
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
    router.push(`/playground/components/${componentPath}` as any);
  };

  const renderComponentCard = (component: ComponentItem) => (
    <Fragment key={component.name}>
      <Flexbox onPress={() => handleComponentPress(component)} padding={16}>
        <Text fontSize={18}>{component.name}</Text>
      </Flexbox>
      <Divider />
    </Fragment>
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
    <PageContainer largeTitleEnabled showBack title="Playground">
      <View style={styles.filterContainer}>
        <Input.Search
          onChangeText={setSearchText}
          placeholder="搜索组件..."
          size="large"
          style={styles.searchContainer}
          value={searchText}
          variant="filled"
        />

        <View style={styles.filterTabs}>
          <CapsuleTabs
            items={tabItems}
            onSelect={setSelectedCategory}
            selectedKey={selectedCategory}
            size="large"
          />
        </View>
      </View>
      <Flexbox gap={32}>
        {Object.entries(groupedComponents).map(([group, components]) =>
          renderGroupSection(group, components),
        )}
      </Flexbox>
    </PageContainer>
  );
}
