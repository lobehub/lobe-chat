import React, { useMemo, useState, memo, useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';

import { useStyles } from './style';

export interface TokenTableProps {
  title: string;
  token: Record<string, any>;
}

const TokenTable: React.FC<TokenTableProps> = memo(({ token, title }) => {
  const { styles } = useStyles();
  const [searchText, setSearchText] = useState('');

  // 优化搜索输入处理
  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  // 将 token 对象转换为可搜索的条目
  const tokenEntries = useMemo(() => {
    return Object.entries(token).map(([name, value]) => ({
      name,
      value,
    }));
  }, [token]);

  const filteredTokens = useMemo(() => {
    return tokenEntries.filter((entry) =>
      entry.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [tokenEntries, searchText]);

  const renderValue = useCallback(
    (entry: { name: string; value: any }) => {
      const { value } = entry;

      // 根据名称判断是否为颜色值
      if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        return (
          <View style={styles.colorValueContainer}>
            <View style={[styles.colorPreview, { backgroundColor: value }]} />
            <Text style={styles.tokenValue}>{value}</Text>
          </View>
        );
      }

      return (
        <Text style={styles.tokenValue}>
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </Text>
      );
    },
    [styles],
  );

  return (
    <View style={styles.tokenTable}>
      <Text style={styles.tableTitle}>{title}</Text>
      <Text style={styles.tableSubtitle}>{filteredTokens.length} tokens</Text>

      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <TextInput
          onChangeText={handleSearchChange}
          placeholder="搜索令牌..."
          placeholderTextColor={styles.searchInputPlaceholder.color}
          style={styles.searchInput}
          value={searchText}
        />
      </View>

      <View style={styles.tokensContainer}>
        {tokenEntries.map((entry) => (
          <View key={entry.name} style={styles.tokenRow}>
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenName}>{entry.name}</Text>
            </View>
            <View style={styles.tokenValueContainer}>{renderValue(entry)}</View>
          </View>
        ))}
      </View>
    </View>
  );
});

export default TokenTable;
