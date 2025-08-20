import React, { memo } from 'react';
import { View, Text } from 'react-native';

import Highlighter from '@/components/Highlighter';
import { useTheme } from '@/theme';

import { useStyles } from './style';

export interface TokenJsonProps {
  title: string;
  token: Record<string, any>;
}

const TokenJson: React.FC<TokenJsonProps> = memo(({ token, title }) => {
  const { theme } = useTheme();
  const { styles } = useStyles();

  return (
    <View style={[styles.container, { backgroundColor: theme.token.colorBgElevated }]}>
      <Text style={[styles.title, { color: theme.token.colorText }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.token.colorTextSecondary }]}>
        {Object.keys(token).length} tokens
      </Text>

      <View style={styles.highlightContainer}>
        <Highlighter
          code={JSON.stringify(token, null, 2)}
          copyable={true}
          defalutExpand={false}
          fullFeatured={true}
          lang="json"
          showLanguage={true}
          style={styles.highlighter}
          type="default"
        />
      </View>
    </View>
  );
});

export default TokenJson;
