import React from 'react';
import { View, Text } from 'react-native';

import TextInput from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
  description: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    marginBottom: token.marginSM,
  },
  noResults: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    fontStyle: 'italic',
    padding: token.paddingMD,
    textAlign: 'center',
  },
  searchResult: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadiusSM,
    marginBottom: token.marginXS,
    padding: token.paddingMD,
  },
  searchResultText: {
    color: token.colorText,
    fontSize: token.fontSize,
  },
  sectionTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: '600',
    marginBottom: token.marginXS,
    marginTop: token.marginMD,
  },
}));

const SearchDemo = () => {
  const { styles } = useStyles();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [recentSearches] = React.useState(['用户管理', 'React Native', '组件库', '移动开发']);

  // 模拟搜索结果
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];

    const mockData = [
      '用户管理系统',
      'React Native 开发指南',
      '组件库设计原则',
      '移动开发最佳实践',
      'TypeScript 类型定义',
      'UI 组件设计',
    ];

    return mockData.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>基础搜索</Text>
      <Text style={styles.description}>内置搜索图标，returnKeyType为search</Text>
      <TextInput.Search
        onChangeText={setSearchQuery}
        placeholder="搜索内容..."
        value={searchQuery}
      />

      <Text style={styles.sectionTitle}>不同场景的搜索框</Text>
      <TextInput.Search placeholder="搜索用户..." />
      <TextInput.Search placeholder="搜索文档..." />
      <TextInput.Search placeholder="搜索设置..." />
      <TextInput.Search placeholder="全局搜索..." />

      {searchQuery ? (
        <>
          <Text style={styles.sectionTitle}>搜索结果</Text>
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <View key={index} style={styles.searchResult}>
                <Text style={styles.searchResultText}>{result}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noResults}>没有找到相关结果</Text>
          )}
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>最近搜索</Text>
          <Text style={styles.description}>输入内容开始搜索</Text>
          {recentSearches.map((search, index) => (
            <View key={index} style={styles.searchResult}>
              <Text style={styles.searchResultText}>{search}</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
};

export default SearchDemo;
