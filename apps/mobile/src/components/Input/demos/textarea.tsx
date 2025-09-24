import React from 'react';
import { View } from 'react-native';

import { Input } from '@/components';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
}));

const TextAreaDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <Input.TextArea autoCorrect={false} numberOfLines={4} placeholder="请输入详细描述" />
      <Input.TextArea
        defaultValue="这是一段多行文本，可以在这里编写更长的内容。"
        placeholder="支持自适应高度"
        style={{ minHeight: 160 }}
        variant="outlined"
      />
    </View>
  );
};

export default TextAreaDemo;
