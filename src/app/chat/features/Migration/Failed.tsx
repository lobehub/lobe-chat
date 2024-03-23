import { Alert, Highlighter, Icon } from '@lobehub/ui';
import { Button, Popconfirm, Result } from 'antd';
import { useTheme } from 'antd-style';
import { createStore, del, get, set } from 'idb-keyval';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { lighten } from 'polished';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import Balancer from 'react-wrap-balancer';

import { githubService } from '@/services/github';

import ExportConfigButton from './ExportConfigButton';
import UpgradeButton from './UpgradeButton';
import { MigrationError, UpgradeStatus, V1DB_NAME, V1DB_TABLE_NAME } from './const';

const clearLocal = async () => {
  const store = createStore(V1DB_NAME, V1DB_TABLE_NAME);
  // delete the state key and back it up to state_backup for reproduce
  const state = await get('state', store);
  await del('state');
  await set('state_backup', state, store);
  location.reload();
};

interface FailedProps {
  error?: MigrationError;
  setError: (error: MigrationError) => void;
  setUpgradeStatus: (status: UpgradeStatus) => void;
  state: any;
  upgradeStatus: UpgradeStatus;
}
const Failed = memo<FailedProps>(({ error, state, setUpgradeStatus, setError, upgradeStatus }) => {
  const { t } = useTranslation('migration');
  const theme = useTheme();

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
            <ExportConfigButton primary state={state} />
            <Popconfirm
              arrow={false}
              okButtonProps={{
                danger: true,
                type: 'primary',
              }}
              onConfirm={clearLocal}
              overlayInnerStyle={{ background: lighten(0.03, theme.colorBgElevated) }}
              overlayStyle={{ width: 340 }}
              title={t('dbV1.clear.confirm')}
            >
              <Button size={'large'}>{t('dbV1.action.clearDB')}</Button>
            </Popconfirm>
            <UpgradeButton
              primary={false}
              setError={setError}
              setUpgradeStatus={setUpgradeStatus}
              state={state}
              upgradeStatus={upgradeStatus}
            >
              {t('dbV1.action.reUpgrade')}
            </UpgradeButton>
          </Flexbox>
        </Flexbox>
      }
      icon={<Icon icon={ShieldAlert} />}
      status={'error'}
      style={{ paddingBlock: 24, width: 450 }}
      subTitle={
        <Balancer>
          <Trans i18nKey="dbV1.upgrade.error.subTitle" ns={'migration'}>
            非常抱歉，数据库升级过程发生异常。请重试升级，或
            <Link
              aria-label={'issue'}
              href="https://github.com/lobehub/lobe-chat/issues"
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
      title={t('dbV1.upgrade.error.title')}
    />
  );
});

export default Failed;
