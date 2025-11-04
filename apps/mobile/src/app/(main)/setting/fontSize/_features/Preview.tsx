import { Block, Flexbox, Markdown } from '@lobehub/ui-rn';
import { useTranslation } from 'react-i18next';

import { useStyles } from '@/features/ChatItem/style';
import { useSettingStore } from '@/store/setting';

const Preview = () => {
  const { styles } = useStyles();
  const { fontSize } = useSettingStore();
  const { t } = useTranslation('setting');

  return (
    <Flexbox gap={16}>
      <Flexbox horizontal justify={'flex-end'}>
        <Block style={[{ pointerEvents: 'box-none' }, styles.userBubble]} variant={'outlined'}>
          <Markdown fontSize={fontSize}>{t('fontSize.preview.userQuestion')}</Markdown>
        </Block>
      </Flexbox>
      <Block style={[{ pointerEvents: 'box-none' }, styles.aiBubble]} variant={'borderless'}>
        <Markdown fontSize={fontSize}>{t('fontSize.preview.botAnswer')}</Markdown>
      </Block>
      <Flexbox horizontal justify={'flex-end'}>
        <Block style={[{ pointerEvents: 'box-none' }, styles.userBubble]} variant={'outlined'}>
          <Markdown fontSize={fontSize}>{t('fontSize.preview.userGreat')}</Markdown>
        </Block>
      </Flexbox>
      <Block style={[{ pointerEvents: 'box-none' }, styles.aiBubble]} variant={'borderless'}>
        <Markdown fontSize={fontSize}>{t('fontSize.preview.botGreat')}</Markdown>
      </Block>
    </Flexbox>
  );
};

export default Preview;
