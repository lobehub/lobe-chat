import { Alert, Icon } from '@lobehub/ui';
import { Blend, Cloud, LaptopMinimalIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useDetailContext } from '@/features/MCPPluginDetail/DetailProvider';

const icons = {
  hybrid: Blend,
  local: LaptopMinimalIcon,
  remote: Cloud,
};

const ConnectionTypeAlert = memo(() => {
  const { t } = useTranslation('discover');
  const { connectionType } = useDetailContext();

  if (!connectionType || !icons[connectionType]) return null;

  return (
    <Alert
      description={t(`mcp.details.connectionType.${connectionType}.desc`)}
      message={
        <Flexbox align={'center'} gap={6} horizontal>
          <Icon icon={icons[connectionType]} size={20} />
          {t(`mcp.details.connectionType.${connectionType}.title`)}
        </Flexbox>
      }
      showIcon={false}
    />
  );
});

export default ConnectionTypeAlert;
