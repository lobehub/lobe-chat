import { ModelTag as DefaultModelTag, ModelIcon, ModelTagProps } from '@lobehub/icons';
import { Tag } from '@lobehub/ui';
import { memo } from 'react';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

const CustomModelTag = memo<ModelTagProps>(({ type = 'mono', model, ...rest }) => {
  const enabledList = useUserStore(modelProviderSelectors.modelProviderListForModelSelect);

  const modelProvider = enabledList.find((provider) =>
    provider.chatModels.some((chatModel) => chatModel.id === model),
  );

  const modelCard = modelProvider?.chatModels.find((chatModel) => chatModel.id === model);

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
