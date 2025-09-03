import React from 'react';
import { View } from 'react-native';

import { Markdown } from '@/components';
import { createStyles } from '@/theme';
import { useSettingStore } from '@/store/setting';

const usePreviewStyles = createStyles((token) => ({
  aiBubble: {
    width: '100%',
  },
  bubble: {
    borderRadius: token.borderRadius,
    paddingHorizontal: token.paddingSM,
  },
  container: {
    width: '100%',
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: token.marginXS,
    marginVertical: token.marginXS,
  },
  rowRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userBubble: {
    backgroundColor: token.colorBgContainer,
  },
}));

const Preview = () => {
  const { styles } = usePreviewStyles();
  const { fontSize } = useSettingStore();

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.rowRight]}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Markdown fontSize={fontSize}>{'我想把对话字体调大一些，该怎么做？'}</Markdown>
        </View>
      </View>
      <View style={[styles.row, styles.aiBubble]}>
        <View style={[styles.bubble]}>
          <Markdown
            fontSize={fontSize}
          >{`**如何调整字体大小？**\n\n使用下方的滑块即可调节字体大小：向左变小，向右变大。拖动时，这里会实时预览效果。\n\n小提示：选择“${'标准'}”刻度可快速恢复默认大小。`}</Markdown>
        </View>
      </View>
      <View style={[styles.row, styles.rowRight]}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Markdown fontSize={fontSize}>{'很棒！'}</Markdown>
        </View>
      </View>
      <View style={[styles.row, styles.aiBubble]}>
        <View style={[styles.bubble]}>
          <Markdown fontSize={fontSize}>
            {'很高兴你喜欢！这个预览功能让你可以在应用设置之前直观地看到在对话框中的对话效果。'}
          </Markdown>
        </View>
      </View>
    </View>
  );
};

export default Preview;
