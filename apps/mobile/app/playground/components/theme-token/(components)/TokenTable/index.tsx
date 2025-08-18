import React, { useMemo } from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '@/theme';

import { useStyles } from './style';

export interface TokenInfo {
  description: string;
  name: string;
  type: 'other';
  value: any;
}

export interface TokenTableProps {
  searchText: string;
  title: string;
  tokens: TokenInfo[];
}

const TokenTable: React.FC<TokenTableProps> = ({ tokens, title, searchText }) => {
  const { theme } = useTheme();
  const { styles } = useStyles();

  const filteredTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(searchText.toLowerCase()) ||
        token.description.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [tokens, searchText]);

  // 直接按名称排序，不再分组
  const sortedTokens = useMemo(() => {
    return filteredTokens.sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredTokens]);

  const renderValue = (token: TokenInfo) => {
    const { value, name } = token;

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

      <View style={styles.tokensContainer}>
        {sortedTokens.map((token) => (
          <View
            key={token.name}
            style={[styles.tokenRow, { borderBottomColor: theme.token.colorBorderSecondary }]}
          >
            <View style={styles.tokenInfo}>
              <Text style={[styles.tokenName, { color: theme.token.colorText }]}>{token.name}</Text>
              <Text style={[styles.tokenDescription, { color: theme.token.colorTextSecondary }]}>
                {token.description}
              </Text>
            </View>
            <View style={styles.tokenValueContainer}>{renderValue(token)}</View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TokenTable;
