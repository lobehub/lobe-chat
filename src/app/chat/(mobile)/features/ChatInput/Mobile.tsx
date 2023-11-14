import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ActionBar from '@/app/chat/features/ChatInput/ActionBar';
import InputAreaInner from '@/app/chat/features/ChatInput/InputAreaInner';
import SaveTopic from '@/app/chat/features/ChatInput/Topic';

import SendButton from './SendButton';
import { useStyles } from './style.mobile';

const ChatInputArea = memo(() => {
  const { cx, styles } = useStyles();

  return (
    <Flexbox className={cx(styles.container)} gap={12}>
      <ActionBar rightAreaStartRender={<SaveTopic />} />
      <Flexbox className={styles.inner} gap={8} horizontal>
        <InputAreaInner mobile />
        <SendButton />
      </Flexbox>
    </Flexbox>
  );
});

export default ChatInputArea;
