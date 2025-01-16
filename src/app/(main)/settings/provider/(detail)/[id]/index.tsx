'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ModelList from '../../features/ModelList';
import ProviderConfig, { ProviderConfigProps } from '../../features/ProviderConfig';

const ProviderDetail = memo<ProviderConfigProps>((card) => {
  return (
    <Flexbox gap={24} paddingBlock={8}>
      <ProviderConfig {...card} />
      <ModelList id={card.id} />
    </Flexbox>
  );
});

export default ProviderDetail;
