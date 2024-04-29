'use client';

import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { shuffle } from 'lodash-es';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { USAGE_DOCUMENTS } from '@/const/url';
import { useChatInput } from '@/features/ChatInput/useChatInput';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    cursor: pointer;

    padding: 12px 24px;

    color: ${token.colorText};

    background: ${token.colorBgContainer};
    border-radius: 48px;

    &:hover {
      background: ${token.colorBgElevated};
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
]).slice(0, 5);

const QuestionSuggest = memo(() => {
  const { onInput, onSend } = useChatInput();
  const { t } = useTranslation('welcome');
  const { styles } = useStyles();

  const handoleSend = (qa: string) => {
    onInput(qa);
    onSend();
  };

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
        {qa.map((item) => {
          const text = t(`guide.qa.${item}` as any);
          return (
            <Flexbox
              align={'center'}
              className={styles.card}
              gap={8}
              horizontal
              key={item}
              onClick={() => handoleSend(text)}
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
