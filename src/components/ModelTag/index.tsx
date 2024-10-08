'use client';

import { ModelTag as DefaultModelTag, ModelIcon, ModelTagProps } from '@lobehub/icons';
import { Tag } from '@lobehub/ui';
import { memo } from 'react';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';
import { ModelProviderCard } from '@/types/llm';

interface CustomModelTagProps extends ModelTagProps {
  providerId?: string;
}

function findModelCard(enabledList: ModelProviderCard[], model: string, providerId?: string) {
  if (providerId) {
    const specificProvider = enabledList.find((p) => p.id === providerId) as ModelProviderCard;
    const modelCard = specificProvider?.chatModels.find((chatModel) => chatModel.id === model);
    if (modelCard) return modelCard;
  }

  for (const provider of enabledList) {
    const modelCard = provider.chatModels.find((chatModel) => chatModel.id === model);
    if (modelCard) return modelCard;
  }

  return null;
}

const CustomModelTag = memo<CustomModelTagProps>(
  ({ type = 'mono', model, providerId, ...rest }) => {
    const enabledList = useUserStore(modelProviderSelectors.modelProviderListForModelSelect);
    const modelCard = findModelCard(enabledList, model, providerId);
    return (
      <Tag icon={<ModelIcon model={model} type={type} />} {...rest}>
        {modelCard?.displayName || model}
      </Tag>
    );
  },
);

const ModelTag = memo<CustomModelTagProps>(({ type = 'mono', model, ...rest }) => {
  const { modelTagUseModelName } = useServerConfigStore(featureFlagsSelectors);
  return modelTagUseModelName ? (
    <CustomModelTag model={model} type={type} {...rest} />
  ) : (
    <DefaultModelTag model={model} type={type} {...rest} />
  );
});

export default ModelTag;
