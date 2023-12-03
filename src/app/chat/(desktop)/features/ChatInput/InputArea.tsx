import { createStyles } from 'antd-style';
import { memo } from 'react';

import InputAreaInner from '@/app/chat/features/ChatInput/InputAreaInner';

const useStyles = createStyles(({ css }) => {
  return {
    textarea: css`
      height: 100% !important;
      padding: 0 24px;
      line-height: 1.5;
    `,
    textareaContainer: css`
      position: relative;
      flex: 1;
    `,
  };
});

const InputArea = memo(() => {
  const { styles } = useStyles();

  return (
    <div className={styles.textareaContainer}>
      <InputAreaInner className={styles.textarea} />
    </div>
  );
});

export default InputArea;
