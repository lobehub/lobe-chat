import { ModelTag as DefaultModelTag, ModelIcon, ModelTagProps } from '@lobehub/icons';
import { Tag } from '@lobehub/ui';
import { memo } from 'react';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

const CustomModelTag = memo<ModelTagProps>(({ type = 'mono', model, ...rest }) => {
  const enabledList = useUserStore(modelProviderSelectors.modelProviderListForModelSelect);

  let modelCard;

  for (const provider of enabledList) {
    modelCard = provider.chatModels.find((chatModel) => chatModel.id === model);
    if (modelCard) break;
  }

  return (
    <Tag icon={<ModelIcon model={model} type={type} />} {...rest}>
      {modelCard?.displayName || model}
    </Tag>
  );
});

const ModelTag = memo<ModelTagProps>(({ type = 'mono', model, ...rest }) => {
  const { useModelName } = useServerConfigStore(featureFlagsSelectors);
  return useModelName ? (
    <CustomModelTag model={model} type={type} {...rest} />
  ) : (
    <DefaultModelTag model={model} type={type} {...rest} />
  );
});

export default ModelTag;
