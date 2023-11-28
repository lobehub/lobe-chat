'use client';

import { Icon } from '@lobehub/ui';
import { Button, Upload } from 'antd';
import { RcFile } from 'antd/es/upload/interface';
import { SendHorizonal } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useImportConfig } from '@/hooks/useImportConfig';
import { useSessionStore } from '@/store/session';

import Hero from './Hero';
import { useStyles } from './style';

const Banner = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { importConfig } = useImportConfig();
  const { t } = useTranslation('welcome');
  const { styles } = useStyles();
  const [switchSession, switchBackToChat, router, isMobile] = useSessionStore((s) => [
    s.switchSession,
    s.switchBackToChat,
    s.router,
    s.isMobile,
  ]);
  const handleImport = useCallback((e: RcFile) => {
    importConfig(e);
    switchSession();
  }, []);

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
        <Upload beforeUpload={handleImport} maxCount={1} showUploadList={false}>
          <Button block={mobile} size={'large'}>
            {t('button.import')}
          </Button>
        </Upload>
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
