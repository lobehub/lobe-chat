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
import Hero from './Hero';

const Banner = memo<{ mobile?: boolean }>(() => {
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
    <Flexbox height={'80vh'} style={{ paddingTop: '10vh' }}>
      <GridShowcase>
        <div className={styles.container} ref={ref}>
          <Hero width={width} />
        </div>
        <Flexbox gap={16} horizontal style={{ marginTop: 16 }}>
          <Upload maxCount={1} onChange={handleImport} showUploadList={false}>
            <Button size={'large'}>{t('button.import')}</Button>
          </Upload>
          <Link href={'/chat'}>
            <Button size={'large'} type={'primary'}>
              <Flexbox align={'center'} gap={4} horizontal>
                {t('button.start')}
                <Icon icon={SendHorizonal} />
              </Flexbox>
            </Button>
          </Link>
        </Flexbox>
      </GridShowcase>
      {/*TODO：暂时隐藏，待模板完成后再补回*/}
      {/*<AgentTemplate width={width} />*/}
    </Flexbox>
  );
});

export default Banner;
