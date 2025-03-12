'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import { aiProviderService } from '@/services/aiProvider';

import ModelList from '../../features/ModelList';
import ProviderConfig from '../../features/ProviderConfig';

const ClientMode = memo<{ id: string }>(({ id }) => {
  const { data, isLoading } = useSWR('get-client-provider', () =>
    aiProviderService.getAiProviderById(id),
  );

  return (
    <Flexbox gap={24} paddingBlock={8}>
      {!isLoading && data && <ProviderConfig {...data} />}
      <ModelList id={id} />
    </Flexbox>
  );
});

export default ClientMode;
