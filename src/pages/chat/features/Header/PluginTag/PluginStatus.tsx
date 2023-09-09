import { ActionIcon } from '@lobehub/ui';
import { Badge } from 'antd';
import { LucideRotateCw } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { pluginSelectors, usePluginStore } from '@/store/plugin';

const PluginStatus = memo<{ id: string; title?: string }>(({ title, id }) => {
  const { t } = useTranslation('common');
  const [status, fetchPluginManifest] = usePluginStore((s) => [
    pluginSelectors.getPluginManifestLoadingStatus(id)(s),
    s.fetchPluginManifest,
  ]);

  const renderStatus = useMemo(() => {
    switch (status) {
      case 'loading': {
        return <Badge color={'blue'} status={'processing'} />;
      }
      case 'error': {
        return (
          <ActionIcon
            icon={LucideRotateCw}
            onClick={() => {
              fetchPluginManifest(id);
            }}
            size={'small'}
            title={t('retry')}
          />
        );
      }
      case 'success': {
        return <Badge status={status} />;
      }
    }
  }, [status]);

  return (
    <Flexbox gap={12} horizontal justify={'space-between'}>
      {title} {renderStatus}
    </Flexbox>
  );
});

export default PluginStatus;
