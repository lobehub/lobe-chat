import { Button } from 'antd';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ClientService } from '@/services/import/_deprecated';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';

import { MigrationError, UpgradeStatus } from './const';

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
        setUpgradeStatus(UpgradeStatus.UPGRADING);

        const configService = new ClientService();
        await configService.importConfigState({
          exportType: 'sessions',
          state: state,
          version: 7,
        });

        await refreshSession();
        await refreshMessages();
        await refreshTopic();

        localStorage.setItem('V2DB_IS_MIGRATED', '1');

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
