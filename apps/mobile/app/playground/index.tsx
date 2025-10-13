import { CapsuleTabItem, CapsuleTabs, Divider, Input, PageContainer } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { kebabCase } from 'lodash-es';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

  // 过滤组件
  const getFilteredComponents = (): ComponentItem[] => {
    let components = getAllComponents();

    if (searchText) {
      components = searchComponentsByName(searchText);
    }

    if (selectedCategory) {
      components = components.filter((c) => c.category === selectedCategory);
    }

    return components;
  };

  const filteredComponents = getFilteredComponents();

  const handleComponentPress = (component: ComponentItem) => {
    // 使用 kebabCase 自动将组件名转换为路径
    const componentPath = kebabCase(component.name);
    router.push(`/playground/components/${componentPath}` as any);
  };

  const renderComponentCard = (component: ComponentItem) => (
    <TouchableOpacity
      activeOpacity={0.7}
      key={component.name}
      onPress={() => handleComponentPress(component)}
    >
      <View>
        <Text style={styles.componentName}>{component.name}</Text>
      </View>
      <Divider />
    </TouchableOpacity>
  );

  return (
    <PageContainer showBack title="Playground">
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        <View style={styles.componentList}>{filteredComponents.map(renderComponentCard)}</View>
      </ScrollView>
    </PageContainer>
  );
}
