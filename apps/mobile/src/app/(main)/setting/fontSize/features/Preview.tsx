import { Markdown, createStyles } from '@lobehub/ui-rn';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useSettingStore } from '@/store/setting';

const usePreviewStyles = createStyles(({ token }) => ({
  aiBubble: {
    width: '100%',
  },
  bubble: {
    borderRadius: token.borderRadius,
    paddingInline: token.paddingSM,
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
  const { t } = useTranslation('setting');

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.rowRight]}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Markdown fontSize={fontSize}>{t('fontSize.preview.userQuestion')}</Markdown>
        </View>
      </View>
      <View style={[styles.row, styles.aiBubble]}>
        <View style={[styles.bubble]}>
          <Markdown fontSize={fontSize}>{t('fontSize.preview.botAnswer')}</Markdown>
        </View>
      </View>
      <View style={[styles.row, styles.rowRight]}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Markdown fontSize={fontSize}>{t('fontSize.preview.userGreat')}</Markdown>
        </View>
      </View>
      <View style={[styles.row, styles.aiBubble]}>
        <View style={[styles.bubble]}>
          <Markdown fontSize={fontSize}>{t('fontSize.preview.botGreat')}</Markdown>
        </View>
      </View>
    </View>
  );
};

export default Preview;
