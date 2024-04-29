import { Button } from 'antd';
import { createStore, set } from 'idb-keyval';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Migration } from '@/migrations';
import { configService } from '@/services/config';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';

import { MIGRATE_KEY, MigrationError, UpgradeStatus, V1DB_NAME, V1DB_TABLE_NAME } from './const';

export interface UpgradeButtonProps {
  children?: ReactNode;
  primary?: boolean;
  setError: (error: MigrationError) => void;
  setUpgradeStatus: (status: UpgradeStatus) => void;
  state: any;
  upgradeStatus: UpgradeStatus;
}

const UpgradeButton = memo<UpgradeButtonProps>(
  ({ setUpgradeStatus, upgradeStatus, state, setError, primary = true, children }) => {
    const { t } = useTranslation('migration');

    const refreshSession = useSessionStore((s) => s.refreshSessions);
    const [refreshMessages, refreshTopic] = useChatStore((s) => [
      s.refreshMessages,
      s.refreshTopic,
    ]);

    const upgrade = async () => {
      try {
        const data = Migration.migrate({ state, version: 1 });

        setUpgradeStatus(UpgradeStatus.UPGRADING);

        await configService.importConfigState({
          exportType: 'sessions',
          state: data.state,
          version: 2,
        });

        await refreshSession();
        await refreshMessages();
        await refreshTopic();

        await set(MIGRATE_KEY, true, createStore(V1DB_NAME, V1DB_TABLE_NAME));

        setUpgradeStatus(UpgradeStatus.UPGRADED);

        return { success: true };
      } catch (error) {
        setUpgradeStatus(UpgradeStatus.UPGRADE_FAILED);
        const err = error as { message: string; stack: string };

        setError({ message: err.message, stack: err.stack });
      }
    };

    return (
      <Button
        loading={upgradeStatus === UpgradeStatus.UPGRADING}
        onClick={upgrade}
        size={'large'}
        type={primary ? 'primary' : undefined}
      >
        {children ?? t('dbV1.action.upgrade')}
      </Button>
    );
  },
);

export default UpgradeButton;
