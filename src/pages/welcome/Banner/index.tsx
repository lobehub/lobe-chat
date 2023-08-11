import { GridShowcase, Icon } from '@lobehub/ui';
import { useSize } from 'ahooks';
import { Button, Upload } from 'antd';
import { SendHorizonal } from 'lucide-react';
import Link from 'next/link';
import Router from 'next/router';
import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useImportConfig } from '@/hooks/useImportConfig';

import { useStyles } from '../style';
import AgentTemplate from './AgentTemplate';
import Hero from './Hero';

const Banner = memo(() => {
  const { importConfig } = useImportConfig();
  const ref = useRef(null);
  const domSize = useSize(ref);
  const width = domSize?.width || 1024;
  const { t } = useTranslation('welcome');

  const { styles } = useStyles();

  const handleImport = useCallback((e: any) => {
    importConfig(e);
    Router.push('/chat');
  }, []);

  return (
    <>
      <GridShowcase>
        <div className={styles.container} ref={ref}>
          <Hero width={width} />
        </div>
        <Flexbox gap={16} horizontal style={{ marginTop: 16 }}>
          <Link href={'/chat'}>
            <Button size={'large'} type={'primary'}>
              <Flexbox align={'center'} gap={4} horizontal>
                {t('button.start')}
                <Icon icon={SendHorizonal} />
              </Flexbox>
            </Button>
          </Link>
          <Upload maxCount={1} onChange={handleImport} showUploadList={false}>
            <Button size={'large'}>{t('button.import')}</Button>
          </Upload>
        </Flexbox>
      </GridShowcase>
      <AgentTemplate width={width} />
    </>
  );
});

export default Banner;
