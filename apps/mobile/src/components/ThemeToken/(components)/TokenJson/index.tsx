import { memo } from 'react';
import { View } from 'react-native';

import Highlighter from '@/components/Highlighter';
import Text from '@/components/Text';

import { useStyles } from './style';

export interface TokenJsonProps {
  title: string;
  token: Record<string, any>;
}

const TokenJson = memo<TokenJsonProps>(({ token, title }) => {
  const { styles, theme } = useStyles();

  return (
    <View style={[styles.container, { backgroundColor: theme.colorBgElevated }]}>
      <Text style={[styles.title, { color: theme.colorText }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.colorTextSecondary }]}>
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
        />
      </View>
    </View>
  );
});

export default TokenJson;
