import { Alert, Highlighter, Icon } from '@lobehub/ui';
import { Button, Popconfirm, Result } from 'antd';
import { useTheme } from 'antd-style';
import { clear, createStore } from 'idb-keyval';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { lighten } from 'polished';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ExportConfigButton from './ExportConfigButton';
import UpgradeButton from './UpgradeButton';
import { UpgradeStatus, V1DB_NAME, V1DB_TABLE_NAME } from './const';

const clearLocal = () => {
  clear(createStore(V1DB_NAME, V1DB_TABLE_NAME));
  location.reload();
};

interface FailedProps {
  error?: any;
  setError: (error: any) => void;
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
            style={{
              alignSelf: 'center',
            }}
          >
            <ExportConfigButton primary state={state} />
            <Popconfirm
              okButtonProps={{
                danger: true,
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
        <Trans i18nKey="dbV1.upgrade.error.subTitle" ns={'migration'}>
          非常抱歉，数据库升级过程发生异常。请重试升级，或
          <Link
            aria-label={'issue'}
            href="https://github.com/lobehub/lobe-chat/issues/151"
            target="_blank"
          >
            提交问题
          </Link>
          中 ，敬请期待 ✨
        </Trans>
      }
      title={t('dbV1.upgrade.error.title')}
    />
  );
});

export default Failed;
