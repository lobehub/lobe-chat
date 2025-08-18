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

  // 直接按名称排序
  const sortedTokens = useMemo(() => {
    return filteredTokens.sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredTokens]);

  const renderValue = useCallback(
    (entry: { name: string; value: any }) => {
      const { value, name } = entry;

      // 根据名称判断是否为颜色值
      if ((name.includes('color') || name.includes('Color')) && typeof value === 'string') {
        return (
          <View style={styles.colorValueContainer}>
            <View style={[styles.colorPreview, { backgroundColor: value }]} />
            <Text style={styles.tokenValue}>{value}</Text>
          </View>
        );
      }

      // 根据名称判断是否为阴影对象
      if ((name.includes('shadow') || name.includes('Shadow')) && typeof value === 'object') {
        return (
          <Text style={styles.tokenValue}>
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </Text>
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
        {sortedTokens.map((entry) => (
          <View key={entry.name} style={styles.tokenRow}>
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenName}>{entry.name}</Text>
              <Text style={styles.tokenDescription}>Design token</Text>
            </View>
            <View style={styles.tokenValueContainer}>{renderValue(entry)}</View>
          </View>
        ))}
      </View>
    </View>
  );
});

export default TokenTable;
