import { Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ArtifactList from './ArtifactList';

export const Artifacts = memo(() => {
  const { t } = useTranslation('portal');

  return (
    <Flexbox gap={8}>
      <Typography.Title level={5} style={{ marginInline: 12 }}>
        {t('Plugins')}
      </Typography.Title>
      <ArtifactList />
    </Flexbox>
  );
});

export default Artifacts;
