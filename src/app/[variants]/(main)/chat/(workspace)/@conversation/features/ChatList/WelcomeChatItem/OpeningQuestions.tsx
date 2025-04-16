'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';

const useStyles = createStyles(({ css, token, responsive }) => ({
  card: css`
    cursor: pointer;

    padding-block: 12px;
    padding-inline: 24px;
    border-radius: 48px;

    color: ${token.colorText};

    background: ${token.colorBgContainer};

    &:hover {
      background: ${token.colorBgElevated};
    }

    ${responsive.mobile} {
      padding-block: 8px;
      padding-inline: 16px;
    }
  `,

  container: css`
    padding-block: 0;
    padding-inline: 20px;
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
            <div
              className={styles.card}
              key={question}
              onClick={() => {
                updateInputMessage(question);
                sendMessage({ isWelcomeQuestion: true });
              }}
            >
              {question}
            </div>
          );
        })}
      </Flexbox>
    </div>
  );
});

export default OpeningQuestions;
