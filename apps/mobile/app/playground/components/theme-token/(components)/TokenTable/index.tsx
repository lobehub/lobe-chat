import React, { useMemo, useState } from 'react';
import { View, Text, TextInput } from 'react-native';

import { useTheme } from '@/theme';

import { useStyles } from './style';

export interface TokenTableProps {
  title: string;
  token: Record<string, any>;
}

const TokenTable: React.FC<TokenTableProps> = ({ token, title }) => {
  const { theme } = useTheme();
  const { styles } = useStyles();
  const [searchText, setSearchText] = useState('');

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

  // 直接按名称排序，不再分组
  const sortedTokens = useMemo(() => {
    return filteredTokens.sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredTokens]);

  const renderValue = (entry: { name: string; value: any }) => {
    const { value, name } = entry;

    // 根据名称判断是否为颜色值
    if ((name.includes('color') || name.includes('Color')) && typeof value === 'string') {
      return (
        <View style={styles.colorValueContainer}>
          <View
            style={[
              styles.colorPreview,
              { backgroundColor: value },
              { borderColor: theme.token.colorBorderSecondary },
            ]}
          />
          <Text style={[styles.tokenValue, { color: theme.token.colorText }]}>{value}</Text>
        </View>
      );
    }

    // 根据名称判断是否为阴影对象
    if ((name.includes('shadow') || name.includes('Shadow')) && typeof value === 'object') {
      return (
        <View style={styles.shadowValueContainer}>
          <Text style={[styles.tokenValue, { color: theme.token.colorText }]}>
            {JSON.stringify(value, null, 2)}
          </Text>
        </View>
      );
    }

    return (
      <Text style={[styles.tokenValue, { color: theme.token.colorText }]}>
        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
      </Text>
    );
  };

  return (
    <View style={[styles.tokenTable, { backgroundColor: theme.token.colorBgElevated }]}>
      <Text style={[styles.tableTitle, { color: theme.token.colorText }]}>{title}</Text>
      <Text style={[styles.tableSubtitle, { color: theme.token.colorTextSecondary }]}>
        {filteredTokens.length} tokens
      </Text>

      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <TextInput
          onChangeText={setSearchText}
          placeholder="搜索令牌..."
          placeholderTextColor={theme.token.colorTextPlaceholder}
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.token.colorBgContainer,
              borderColor: theme.token.colorBorder,
              color: theme.token.colorText,
            },
          ]}
          value={searchText}
        />
      </View>

      <View style={styles.tokensContainer}>
        {sortedTokens.map((entry) => (
          <View
            key={entry.name}
            style={[styles.tokenRow, { borderBottomColor: theme.token.colorBorderSecondary }]}
          >
            <View style={styles.tokenInfo}>
              <Text style={[styles.tokenName, { color: theme.token.colorText }]}>{entry.name}</Text>
              <Text style={[styles.tokenDescription, { color: theme.token.colorTextSecondary }]}>
                Design token
              </Text>
            </View>
            <View style={styles.tokenValueContainer}>{renderValue(entry)}</View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TokenTable;
