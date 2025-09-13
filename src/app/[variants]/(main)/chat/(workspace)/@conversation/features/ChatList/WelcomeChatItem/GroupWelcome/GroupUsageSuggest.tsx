'use client';

import { ActionIcon, Block, Grid, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { shuffle } from 'lodash-es';
import { RefreshCw } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';

import { useSendGroupMessage } from '../../../ChatInput/useSend';

const useStyles = createStyles(({ css, token, responsive }) => ({
  card: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    height: 100%;
    min-height: 110px;
    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};

    transition: all ${token.motionDurationMid};

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: 0 2px 8px ${token.colorPrimaryBg};
    }

    ${responsive.mobile} {
      min-height: 72px;
    }
  `,
  cardDesc: css`
    margin-block: 0 !important;
    color: ${token.colorTextDescription};
  `,
  cardTitle: css`
    margin-block: 0 !important;
    font-size: 16px;
    font-weight: bold;
  `,
  emoji: css`
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;
    border-radius: ${token.borderRadius}px;

    font-size: 24px;

    background: ${token.colorFillTertiary};
  `,
  title: css`
    color: ${token.colorTextDescription};
  `,
}));

// All available activity keys
const allActivities = [
  'a01',
  'a02',
  'a03',
  'a04',
  'a05',
  'a06',
  'a07',
  'a08',
  'a09',
  'a10',
  'a11',
  'a12',
  'a13',
  'a14',
  'a15',
  'a16',
  'a17',
  'a18',
  'a19',
  'a20',
];

const GroupUsageSuggest = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('welcome');
  const [updateInputMessage] = useChatStore((s) => [s.updateInputMessage]);
  const { styles } = useStyles();
  const { send: sendMessage } = useSendGroupMessage();

  const itemsPerPage = mobile ? 2 : 4;

  const [shuffledActivities, setShuffledActivities] = useState(() => shuffle(allActivities));

  const displayedActivities = shuffledActivities.slice(0, itemsPerPage);

  const handleRefresh = () => {
    setShuffledActivities(shuffle([...allActivities]));
  };

  return (
    <Flexbox gap={8} width={'100%'}>
      <Flexbox align={'center'} horizontal justify={'space-between'}>
        <div className={styles.title}>{t('guide.groupActivities.title')}</div>
        <ActionIcon
          icon={RefreshCw}
          onClick={handleRefresh}
          size={{ blockSize: 24, size: 14 }}
          title="Show more activities"
        />
      </Flexbox>
      <Grid gap={8} rows={2}>
        {displayedActivities.map((activityKey) => {
          const title = t(`guide.groupActivities.${activityKey}.title` as any);
          const emoji = t(`guide.groupActivities.${activityKey}.emoji` as any);
          const description = t(`guide.groupActivities.${activityKey}.description` as any);

          return (
            <Block
              className={styles.card}
              clickable
              gap={12}
              horizontal
              key={activityKey}
              onClick={() => {
                const prompt = t(`guide.groupActivities.${activityKey}.prompt` as any);
                updateInputMessage(prompt);
                sendMessage({ isWelcomeQuestion: true });
              }}
              variant={'outlined'}
            >
              <div className={styles.emoji}>{emoji}</div>
              <Flexbox gap={2} style={{ overflow: 'hidden', width: '100%' }}>
                <Text className={styles.cardTitle} ellipsis={{ rows: 1 }}>
                  {title}
                </Text>
                <Text className={styles.cardDesc} ellipsis={{ rows: mobile ? 1 : 2 }}>
                  {description}
                </Text>
              </Flexbox>
            </Block>
          );
        })}
      </Grid>
    </Flexbox>
  );
});

export default GroupUsageSuggest;
