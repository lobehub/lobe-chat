import { Input } from '@lobehub/ui-rn';
import React from 'react';
import { Text, View } from 'react-native';

import { createStyles } from '@/theme';

const useStyles = createStyles(({ token }) => ({
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

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>基础搜索</Text>
      <Text style={styles.description}>内置搜索图标，returnKeyType为search</Text>
      <Input.Search onChangeText={setSearchQuery} placeholder="搜索内容..." value={searchQuery} />

      <Text style={styles.sectionTitle}>不同场景的搜索框</Text>
      <Input.Search placeholder="搜索用户..." />
      <Input.Search placeholder="搜索文档..." />
      <Input.Search placeholder="搜索设置..." />
      <Input.Search placeholder="全局搜索..." />
    </View>
  );
};

export default SearchDemo;
