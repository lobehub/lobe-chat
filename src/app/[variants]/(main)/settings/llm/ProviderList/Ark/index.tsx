'use client';

import { Input, Select, Space } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DoubaoProviderCard } from '@/config/modelProviders';
import { ModelProvider } from '@/libs/agent-runtime';

import { KeyVaultsConfigKey, LLMProviderApiTokenKey } from '../../const';
import { ProviderItem } from '../../type';

const options = DoubaoProviderCard.chatModels.map((model: any) => ({
  label: model.displayName,
  value: model.id,
}));

const providerKey = ModelProvider.Doubao;

type Model2EndpointValue = Record<string, string>;

interface Props {
  id?: string;
  onChange?: (value: Model2EndpointValue) => void;
  value?: Model2EndpointValue;
}

const Model2EndpointInput = (props: Props) => {
  const { value = {}, onChange } = props;

  const [model, setModel] = useState<string>(DoubaoProviderCard.checkModel || '');

  const triggerChange = (changedValue: Record<string, string>) => {
    onChange?.(changedValue);
  };

  const onEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...value };
    const newEndpoint = e.target.value;
    newValue[model] = newEndpoint;
    triggerChange(newValue);
  };

  const onModelChange = (model: string) => {
    setModel(model);
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Select onChange={onModelChange} options={options} style={{ width: '300px' }} value={model} />
      <Input onChange={onEndpointChange} placeholder="endpoint id" value={value[model]} />
    </Space.Compact>
  );
};

export const useVolcengineArkProvider = (): ProviderItem => {
  const { t } = useTranslation('setting');
  return {
    ...DoubaoProviderCard,
    apiKeyItems: [
      {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`llm.apiKey.placeholder`, { name: 'Ark' })}
          />
        ),
        desc: t(`llm.apiKey.desc`, { name: 'Ark' }),
        label: t(`llm.apiKey.title`),
        name: [KeyVaultsConfigKey, providerKey, LLMProviderApiTokenKey],
      },
      {
        children: <Model2EndpointInput />,
        desc: 'Ark Endpoint',
        label: 'Endpoint',
        name: [KeyVaultsConfigKey, providerKey, 'model2EndpointMap'],
      },
    ],
    proxyUrl: {
      placeholder: 'https://ark.cn-beijing.volces.com/api/v3',
    },
    showApiKey: true,
  };
};
