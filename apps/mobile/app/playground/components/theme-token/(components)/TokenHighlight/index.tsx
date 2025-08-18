import React, { useMemo, memo } from 'react';
import { View, Text } from 'react-native';

import Highlighter from '@/components/Highlighter';
import { useTheme } from '@/theme';

import { useStyles } from './style';

export interface TokenHighlightProps {
  title: string;
  token: Record<string, any>;
}

const TokenHighlight: React.FC<TokenHighlightProps> = memo(({ token, title }) => {
  const { theme } = useTheme();
  const { styles } = useStyles();

  // 直接将 token 对象转换为 JSON 字符串，使用分页加载优化性能
  const tokenJsonData = useMemo(() => {
    const entries = Object.entries(token);
    const totalTokens = entries.length;

    // 如果 token 数量很多，分批显示
    if (totalTokens > 100) {
      const batchSize = 50;
      const firstBatch = entries.slice(0, batchSize);
      const limitedToken = Object.fromEntries(firstBatch);

      return (
        JSON.stringify(limitedToken, null, 2) +
        `\n\n/* 显示前 ${batchSize} 个 token，共 ${totalTokens} 个 */`
      );
    }

    // 数量适中时显示全部
    return JSON.stringify(token, null, 2);
  }, [token]);

  return (
    <View style={[styles.container, { backgroundColor: theme.token.colorBgElevated }]}>
      <Text style={[styles.title, { color: theme.token.colorText }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.token.colorTextSecondary }]}>
        {Object.keys(token).length} tokens
      </Text>

      <View style={styles.highlightContainer}>
        <Highlighter
          code={tokenJsonData}
          copyable={true}
          fullFeatured={false}
          lang="json"
          showLanguage={true}
          style={styles.highlighter}
          type="default"
        />
      </View>
    </View>
  );
});

export default TokenHighlight;
