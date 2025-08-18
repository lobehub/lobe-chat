import React, { useMemo } from 'react';
import { View, Text } from 'react-native';

import Highlighter from '@/components/Highlighter';
import { useTheme } from '@/theme';

import { useStyles } from './style';

export interface TokenHighlightProps {
  title: string;
  token: Record<string, any>;
}

const TokenHighlight: React.FC<TokenHighlightProps> = ({ token, title }) => {
  const { theme } = useTheme();
  const { styles } = useStyles();

  // 直接将 token 对象转换为 JSON 字符串
  const tokenJsonData = useMemo(() => {
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
};

export default TokenHighlight;
