import { Input } from '@lobehub/ui-rn';
import React from 'react';
import { View } from 'react-native';

import { createStyles } from '@/components/theme';

const useStyles = createStyles(({ token }) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
}));

const TextAreaDemo = () => {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.container}>
      <Input.TextArea
        autoSize
        defaultValue="Input.TextArea 现在支持 autoSize，可随内容自动增长。试着输入多行文本查看效果。"
        placeholder="请输入详细描述"
      />
      <Input.TextArea
        autoSize={{ maxRows: 6, minRows: 2 }}
        defaultValue={
          '配置 autoSize={{ minRows: 2, maxRows: 6 }} 将高度限制在指定范围内，非常适合评论或反馈场景。'
        }
        placeholder="可设置最小 / 最大行数"
        variant="outlined"
      />
      <Input.TextArea
        autoSize={{ minRows: 3 }}
        defaultValue="可以通过 style 与 contentStyle 自定义外观，例如用于代码片段或结构化文本场景。"
        placeholder="支持内容样式定制"
        style={{ backgroundColor: theme.colorFillTertiary }}
      />
    </View>
  );
};

export default TextAreaDemo;
