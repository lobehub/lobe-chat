'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ModelList from '../../features/ModelList';
import ProviderConfig, { ProviderConfigProps } from '../../features/ProviderConfig';

interface ProviderDetailProps extends ProviderConfigProps {
  showConfig?: boolean;
}
const ProviderDetail = memo<ProviderDetailProps>(({ showConfig = true, ...card }) => {
  return (
    <Flexbox gap={24} paddingBlock={8}>
      {/* ↓ cloud slot ↓ */}

      {/* ↑ cloud slot ↑ */}
      {showConfig && <ProviderConfig {...card} />}
      <ModelList id={card.id} {...card.settings} />
    </Flexbox>
  );
});

export default ProviderDetail;
