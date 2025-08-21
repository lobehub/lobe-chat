'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import { useClientDataSWR } from '@/libs/swr';
import { aiProviderService } from '@/services/aiProvider';
import { useAiInfraStore } from '@/store/aiInfra';

import ModelList from '../../features/ModelList';
import ProviderConfig from '../../features/ProviderConfig';

const ClientMode = memo<{ id: string }>(({ id }) => {
  const useFetchAiProviderItem = useAiInfraStore((s) => s.useFetchAiProviderItem);
  useFetchAiProviderItem(id);

  const { data, isLoading } = useClientDataSWR('get-client-provider', () =>
    aiProviderService.getAiProviderById(id),
  );

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !data?.id) {
      router.push('/settings/provider');
    }
  }, [isLoading, data]);

  if (isLoading || !data || !data.id) return <Loading />;

  return (
    <Flexbox gap={24} paddingBlock={8}>
      <ProviderConfig {...data} id={id} name={data.name || ''} />
      <ModelList id={id} />
    </Flexbox>
  );
});

export default ClientMode;
