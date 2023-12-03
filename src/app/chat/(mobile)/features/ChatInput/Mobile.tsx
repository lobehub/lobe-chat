import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Files from '@/app/chat/(mobile)/features/ChatInput/Files';
import ActionBar from '@/app/chat/features/ChatInput/ActionBar';
import InputAreaInner from '@/app/chat/features/ChatInput/InputAreaInner';
import STT from '@/app/chat/features/ChatInput/STT';
import SaveTopic from '@/app/chat/features/ChatInput/Topic';

import SendButton from './SendButton';

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      padding: 12px 0;
      background: ${token.colorBgLayout};
      border-top: 1px solid ${rgba(token.colorBorder, 0.25)};
    `,
    inner: css`
      padding: 0 8px;
    `,
  };
});

const ChatInputArea = memo(() => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.container} gap={12}>
      <Files />
      <ActionBar mobile padding={'0 8px'} rightAreaStartRender={<SaveTopic mobile />} />
      <Flexbox className={styles.inner} gap={8} horizontal>
        <STT mobile />
        <InputAreaInner mobile />
        <SendButton />
      </Flexbox>
    </Flexbox>
  );
});

export default ChatInputArea;
