import { Button } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { BRANDING_NAME } from '@/const/branding';

const ExportConfigButton = memo<{ primary?: boolean; state: any }>(({ state, primary }) => {
  const { t } = useTranslation('migration');

  const exportData = () => {
    const config = { exportType: 'sessions', state, version: 1 };

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(config)], { type: 'application/json' }),
    );

    const a = document.createElement('a');
    a.href = url;
    a.download = `${BRANDING_NAME}-backup-v1.json`;

    document.body.append(a);
    a.click();

    URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <Button onClick={exportData} size={'large'} type={primary ? 'primary' : undefined}>
      {t('dbV1.action.downloadBackup')}
    </Button>
  );
});

export default ExportConfigButton;
