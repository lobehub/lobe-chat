'use client';

import { OpenAI } from '@lobehub/icons';

import { GenericOpenAIProviderCard } from '@/config/modelProviders';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { ProviderItem } from '../../type';

export const useGenericOpenAIProvider = (): ProviderItem => {
  const { showOpenAIApiKey } = useServerConfigStore(featureFlagsSelectors);
  return {
    ...GenericOpenAIProviderCard,
    proxyUrl: {
      placeholder: 'http://localhost:5000/v1',
    },
    showApiKey: showOpenAIApiKey,
    title: (
      <div
        style={{
          alignItems: 'start',
          display: 'flex',
          flexDirection: 'row',
          gap: '0.35em',
          paddingTop: '0.5em',
        }}
      >
        <h3 style={{ fontWeight: '500' }}>Generic </h3>
        <OpenAI.Combine size={24} style={{ paddingTop: '0.18em' }} />
      </div>
    ),
  };
};
