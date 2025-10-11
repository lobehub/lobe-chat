import { CapsuleTabItem, CapsuleTabs, Input, PageContainer, Tag } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useStyles } from './styles';
import { ComponentItem } from './type';
import { COMPONENT_CONFIGS, getAllCategories, searchComponentsByName } from './utils';

export default function ComponentPlaygroundIndex() {
  const router = useRouter();
  const { styles, theme } = useStyles();
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
    let components = COMPONENT_CONFIGS;

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
    switch (component.path) {
      case 'tooltip': {
        router.push('/playground/components/tooltip');

        break;
      }
      case 'alert': {
        router.push('/playground/components/alert');

        break;
      }
      case 'toast': {
        router.push('/playground/components/toast');

        break;
      }
      case 'highlighter': {
        router.push('/playground/components/highlighter');

        break;
      }
      case 'markdown': {
        router.push('/playground/components/markdown');

        break;
      }
      case 'listitem': {
        router.push('/playground/components/listitem');

        break;
      }
      case 'avatar': {
        router.push('/playground/components/avatar');

        break;
      }
      case 'space': {
        router.push('/playground/components/space');

        break;
      }
      case 'fluentemoji': {
        router.push('/playground/components/fluentemoji');

        break;
      }
      case 'tag': {
        router.push('/playground/components/tag');

        break;
      }
      case 'capsuletabs': {
        router.push('/playground/components/capsuletabs');

        break;
      }
      case 'button': {
        router.push('/playground/components/button');

        break;
      }
      case 'icon': {
        router.push('/playground/components/icon');

        break;
      }
      case 'action-icon': {
        router.push('/playground/components/action-icon');

        break;
      }
      case 'skeleton': {
        router.push('/playground/components/skeleton');

        break;
      }
      case 'instant-switch': {
        router.push('/playground/components/instant-switch');

        break;
      }
      case 'colorswatches': {
        router.push('/playground/components/colorswatches');

        break;
      }
      case 'colorscales': {
        router.push('/playground/components/colorscales');

        break;
      }
      case 'slider': {
        router.push('/playground/components/slider');

        break;
      }
      case 'theme-provider': {
        router.push('/playground/components/theme-provider');

        break;
      }
      case 'theme-theme': {
        router.push('/playground/components/theme-token');

        break;
      }
      case 'switch': {
        router.push('/playground/components/switch');

        break;
      }
      case 'input': {
        router.push('/playground/components/input');

        break;
      }
      case 'form': {
        router.push('/playground/components/form');

        break;
      }
      case 'flexbox': {
        router.push('/playground/components/flexbox');

        break;
      }
      case 'center': {
        router.push('/playground/components/center');

        break;
      }
      case 'block': {
        router.push('/playground/components/block');

        break;
      }
      case 'card': {
        router.push('/playground/components/card');

        break;
      }
      default: {
        alert(`${component.name} 组件页面正在建设中`);
      }
    }
  };

  const renderComponentCard = (component: ComponentItem) => (
    <TouchableOpacity
      activeOpacity={0.7}
      key={component.name}
      onPress={() => handleComponentPress(component)}
      style={styles.componentCard}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.componentName}>{component.name}</Text>
        <View style={styles.badges}>
          {component.hasReadme && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>README</Text>
            </View>
          )}
          {component.hasDemos && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>DEMO</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.componentDescription}>{component.description}</Text>
      <View style={styles.tagsContainer}>
        {component.tags.slice(0, 3).map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.categoryText}>{component.category}</Text>
        <ChevronRight color={theme.colorTextTertiary} size={20} />
      </View>
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
