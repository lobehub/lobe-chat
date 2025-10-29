import { Block, Flexbox, Markdown, TextArea } from '@lobehub/ui-rn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from '@/features/chat/ChatBubble/style';
import SenderBtn from '@/features/chat/actions/SenderBtn';

const Preview = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('setting');

  // 聊天消息内容
  const chatContent = (
    <Flexbox gap={16}>
      <Flexbox horizontal justify={'flex-end'}>
        <Block style={[{ pointerEvents: 'box-none' }, styles.userBubble]} variant={'outlined'}>
          <Markdown>{t('color.previewMessages.userHowToUse', { ns: 'setting' })}</Markdown>
        </Block>
      </Flexbox>
      <Block style={[{ pointerEvents: 'box-none' }, styles.aiBubble]} variant={'borderless'}>
        <Markdown>{t('color.previewMessages.botHowToUse', { ns: 'setting' })}</Markdown>
      </Block>
      <Flexbox horizontal justify={'flex-end'}>
        <Block style={[{ pointerEvents: 'box-none' }, styles.userBubble]} variant={'outlined'}>
          <Markdown>{t('color.previewMessages.userGreat', { ns: 'setting' })}</Markdown>
        </Block>
      </Flexbox>
      <Block style={[{ pointerEvents: 'box-none' }, styles.aiBubble]} variant={'borderless'}>
        <Markdown>{t('color.previewMessages.botGreat', { ns: 'setting' })}</Markdown>
      </Block>
    </Flexbox>
  );

  // 输入区域
  const inputArea = (
    <Block borderRadius={24} glass variant={'outlined'}>
      <TextArea
        numberOfLines={12}
        placeholder={t('placeholder', { ns: 'chat' })}
        style={{
          flex: 0,
          height: 'auto',
          pointerEvents: 'none',
        }}
        variant={'borderless'}
      />
      <Flexbox horizontal justify={'flex-end'} padding={8}>
        <SenderBtn />
      </Flexbox>
    </Block>
  );

  return (
    <Flexbox gap={48} padding={16}>
      {chatContent}
      {inputArea}
    </Flexbox>
  );
});

export default Preview;
