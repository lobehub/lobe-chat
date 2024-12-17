import { Alert, Highlighter, Icon } from '@lobehub/ui';
import { Button, Result } from 'antd';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import Balancer from 'react-wrap-balancer';

import { GITHUB_ISSUES } from '@/const/url';
import { githubService } from '@/services/github';
import { useGlobalStore } from '@/store/global';

interface MigrationError {
  message: string;
  stack: string;
}

interface FailedProps {
  error?: MigrationError;
}
const FailedModal = memo<FailedProps>(({ error }) => {
  const { t } = useTranslation('common');

  const [initializeClientDB] = useGlobalStore((s) => [s.initializeClientDB]);

  return (
    <Result
      extra={
        <Flexbox gap={24}>
          {!!error && (
            <Alert
              extra={
                <Highlighter copyButtonSize={'small'} language={'json'}>
                  {JSON.stringify(error)}
                </Highlighter>
              }
              message={error.message}
              style={{ flex: 1 }}
              type={'error'}
            />
          )}
          <Flexbox
            gap={16}
            horizontal
            justify={'center'}
            style={{
              alignSelf: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button onClick={() => initializeClientDB()} size={'large'} type={'primary'}>
              {t('clientDB.error.retry')}
            </Button>
          </Flexbox>
        </Flexbox>
      }
      icon={<Icon icon={ShieldAlert} />}
      status={'error'}
      style={{ paddingBlock: 24, width: 450 }}
      subTitle={
        <Balancer>
          <Trans i18nKey="clientDB.error.desc" ns={'common'}>
            非常抱歉，数据库初始化过程发生异常。请尝试重试，或
            <Link
              aria-label={'issue'}
              href={GITHUB_ISSUES}
              onClick={(e) => {
                e.preventDefault();
                githubService.submitDBV1UpgradeError(1, error!);
              }}
              target="_blank"
            >
              提交问题
            </Link>
            我们将会第一时间帮你排查问题。
          </Trans>
        </Balancer>
      }
      title={t('clientDB.error.title')}
    />
  );
});

export default FailedModal;
