'use client';

import { Block } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';

const useStyles = createStyles(({ css, token, responsive }) => ({
  card: css`
    padding-block: 8px;
    padding-inline: 16px;
    border-radius: 48px;
    background: ${token.colorBgContainer};

    ${responsive.mobile} {
      padding-block: 8px;
      padding-inline: 16px;
    }
  `,

  container: css`
    padding-block: 0;
    padding-inline: 64px 16px;
  `,

  title: css`
    color: ${token.colorTextDescription};
  `,
}));

interface OpeningQuestionsProps {
  mobile?: boolean;
  questions: string[];
}

const OpeningQuestions = memo<OpeningQuestionsProps>(({ mobile, questions }) => {
  const { t } = useTranslation('welcome');
  const [updateInputMessage] = useChatStore((s) => [s.updateInputMessage]);

  const { styles } = useStyles();
  const { send: sendMessage } = useSendMessage();

  return (
    <div className={styles.container}>
      <p className={styles.title}>{t('guide.questions.title')}</p>
      <Flexbox gap={8} horizontal wrap={'wrap'}>
        {questions.slice(0, mobile ? 2 : 5).map((question) => {
          return (
            <Block
              className={styles.card}
              clickable
              key={question}
              onClick={() => {
                updateInputMessage(question);
                sendMessage({ isWelcomeQuestion: true });
              }}
              paddingBlock={8}
              paddingInline={12}
              variant={'outlined'}
            >
              {question}
            </Block>
          );
        })}
      </Flexbox>
    </div>
  );
});

export default OpeningQuestions;
