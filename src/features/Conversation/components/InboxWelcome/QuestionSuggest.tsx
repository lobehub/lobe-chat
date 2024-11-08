'use client';

import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { shuffle } from 'lodash-es';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { BRANDING_NAME } from '@/const/branding';
import { USAGE_DOCUMENTS } from '@/const/url';
import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';

const useStyles = createStyles(({ css, token, responsive }) => ({
  card: css`
    cursor: pointer;

    padding-block: 12px;
    padding-inline: 24px;

    color: ${token.colorText};

    background: ${token.colorBgContainer};
    border-radius: 48px;

    &:hover {
      background: ${token.colorBgElevated};
    }

    ${responsive.mobile} {
      padding-block: 8px;
      padding-inline: 16px;
    }
  `,
  icon: css`
    color: ${token.colorTextSecondary};
  `,
  title: css`
    color: ${token.colorTextDescription};
  `,
}));

const qa = shuffle([
  'q01',
  'q02',
  'q03',
  'q04',
  'q05',
  'q06',
  'q07',
  'q08',
  'q09',
  'q10',
  'q11',
  'q12',
  'q13',
  'q14',
  'q15',
]);

const QuestionSuggest = memo<{ mobile?: boolean }>(({ mobile }) => {
  const [updateInputMessage] = useChatStore((s) => [s.updateInputMessage]);

  const { t } = useTranslation('welcome');
  const { styles } = useStyles();
  const { send: sendMessage } = useSendMessage();

  return (
    <Flexbox gap={8} width={'100%'}>
      <Flexbox align={'center'} horizontal justify={'space-between'}>
        <div className={styles.title}>{t('guide.questions.title')}</div>
        <Link href={USAGE_DOCUMENTS} target={'_blank'}>
          <ActionIcon
            icon={ArrowRight}
            size={{ blockSize: 24, fontSize: 16 }}
            title={t('guide.questions.moreBtn')}
          />
        </Link>
      </Flexbox>
      <Flexbox gap={8} horizontal wrap={'wrap'}>
        {qa.slice(0, mobile ? 2 : 5).map((item) => {
          const text = t(`guide.qa.${item}` as any, { appName: BRANDING_NAME });
          return (
            <Flexbox
              align={'center'}
              className={styles.card}
              gap={8}
              horizontal
              key={item}
              onClick={() => {
                updateInputMessage(text);
                sendMessage({ isWelcomeQuestion: true });
              }}
            >
              {t(text)}
            </Flexbox>
          );
        })}
      </Flexbox>
    </Flexbox>
  );
});

export default QuestionSuggest;
