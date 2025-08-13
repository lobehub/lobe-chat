import { useRouter } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ComponentItem } from './type';
import { COMPONENT_CONFIGS, getAllCategories, searchComponentsByName } from './utils';
import { useStyles } from './styles';

export default function ComponentPlaygroundIndex() {
  const router = useRouter();
  const { styles, token } = useStyles();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = getAllCategories();

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
      case 'skeleton': {
        router.push('/playground/components/skeleton');

        break;
      }
      case 'instant-switch': {
        router.push('/playground/components/instant-switch');

        break;
      }
      case 'theme-provider': {
        router.push('/playground/components/theme-provider');

        break;
      }
      case 'theme-token': {
        router.push('/playground/components/theme-token');

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
      style={[
        styles.componentCard,
        {
          backgroundColor: token.colorBgElevated,
          borderColor: token.colorBorderSecondary,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.componentName, { color: token.colorText }]}>{component.name}</Text>
        <View style={styles.badges}>
          {component.hasReadme && (
            <View style={[styles.badge, { backgroundColor: token.colorFillQuaternary }]}>
              <Text style={[styles.badgeText, { color: token.colorTextSecondary }]}>README</Text>
            </View>
          )}
          {component.hasDemos && (
            <View style={[styles.badge, { backgroundColor: token.colorFillQuaternary }]}>
              <Text style={[styles.badgeText, { color: token.colorTextSecondary }]}>DEMO</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={[styles.componentDescription, { color: token.colorTextSecondary }]}>
        {component.description}
      </Text>
      <View style={styles.tagsContainer}>
        {component.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: token.colorFillSecondary }]}>
            <Text style={[styles.tagText, { color: token.colorTextSecondary }]}>{tag}</Text>
          </View>
        ))}
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.categoryText, { color: token.colorTextTertiary }]}>
          {component.category}
        </Text>
        <ChevronRight color={token.colorTextTertiary} size={20} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: token.colorBgLayout }]}>
      <View style={[styles.filterContainer]}>
        <View style={[styles.searchContainer, { backgroundColor: token.colorFillTertiary }]}>
          <Search color={token.colorTextPlaceholder} size={20} style={styles.searchIcon} />
          <TextInput
            onChangeText={setSearchText}
            placeholder="搜索组件..."
            placeholderTextColor={token.colorTextPlaceholder}
            style={[styles.searchInput, { color: token.colorText }]}
            value={searchText}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
          <TouchableOpacity
            onPress={() => setSelectedCategory('')}
            style={[
              styles.filterTab,
              { backgroundColor: token.colorFillSecondary },
              selectedCategory === '' && { backgroundColor: token.colorPrimary },
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: token.colorTextSecondary },
                selectedCategory === '' && { color: token.colorText },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.filterTab,
                { backgroundColor: token.colorFillSecondary },
                selectedCategory === category && { backgroundColor: token.colorPrimary },
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: token.colorTextSecondary },
                  selectedCategory === category && { color: token.colorText },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        <View style={styles.componentList}>{filteredComponents.map(renderComponentCard)}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
