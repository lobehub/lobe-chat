import { GridShowcase, Icon } from '@lobehub/ui';
import { useSize } from 'ahooks';
import { Button, Upload } from 'antd';
import { SendHorizonal } from 'lucide-react';
import Link from 'next/link';
import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { SESSION_CHAT_URL } from '@/const/url';
import { useImportConfig } from '@/hooks/useImportConfig';
import { useSessionStore } from '@/store/session';

import Hero from './Hero';
import { useStyles } from './style';

const Banner = memo<{ mobile?: boolean }>(() => {
  const { importConfig } = useImportConfig();
  const ref = useRef(null);
  const domSize = useSize(ref);
  const width = domSize?.width || 1024;
  const { t } = useTranslation('welcome');

  const { styles } = useStyles();

  const switchSession = useSessionStore((s) => s.switchSession);
  const handleImport = useCallback((e: any) => {
    importConfig(e);
    switchSession();
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
          <Link
            href={SESSION_CHAT_URL()}
            onClick={(e) => {
              e.preventDefault();
              switchSession();
            }}
          >
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
