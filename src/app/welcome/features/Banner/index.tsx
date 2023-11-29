'use client';

import { Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { SendHorizonal } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import DataImporter from '@/features/DataImporter';
import { useSessionStore } from '@/store/session';

import Hero from './Hero';
import { useStyles } from './style';

const Banner = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('welcome');
  const { styles } = useStyles();
  const [switchSession, switchBackToChat, router, isMobile] = useSessionStore((s) => [
    s.switchSession,
    s.switchBackToChat,
    s.router,
    s.isMobile,
  ]);

  return (
    <>
      <div className={styles.container}>
        <Hero mobile={mobile} width={mobile ? 640 : 1024} />
      </div>
      <Flexbox
        className={styles.buttonGroup}
        gap={16}
        horizontal={!mobile}
        justify={'center'}
        width={'100%'}
      >
        <DataImporter
          onFinishImport={() => {
            switchSession();
          }}
        >
          <Button block={mobile} size={'large'}>
            {t('button.import')}
          </Button>
        </DataImporter>
        <Button
          block={mobile}
          onClick={() => (isMobile ? router?.push('/chat') : switchBackToChat())}
          size={'large'}
          type={'primary'}
        >
          <Flexbox align={'center'} gap={4} horizontal justify={'center'}>
            {t('button.start')}
            <Icon icon={SendHorizonal} />
          </Flexbox>
        </Button>
      </Flexbox>
    </>
  );
});

export default Banner;
