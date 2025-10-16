import { ModelIcon } from '@lobehub/icons-rn';
import { Flexbox, InstantSwitch, ModelInfoTags, Text } from '@lobehub/ui-rn';
import { AiProviderModelListItem } from 'model-bank';
import { memo } from 'react';

interface ModelCardProps {
  model: AiProviderModelListItem;
  onToggle: (modelId: string, enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
}

const ModelCard = memo<ModelCardProps>(({ model, onToggle, setLoading }) => {
  const handleToggle = async (value: boolean) => {
    setLoading(true);
    await onToggle(model.id, value);
    setLoading(false);
  };

  return (
    <Flexbox padding={16}>
      <Flexbox gap={8}>
        <Flexbox align={'center'} gap={12} horizontal justify={'space-between'}>
          <Flexbox align={'center'} gap={12} horizontal>
            <ModelIcon model={model.id} size={36} />
            <Flexbox gap={4}>
              <Text ellipsis fontSize={15} weight={500}>
                {model.displayName || model.id}
              </Text>
              <Text code ellipsis fontSize={12} type={'secondary'}>
                {model.id}
              </Text>
            </Flexbox>
          </Flexbox>
          <InstantSwitch checked={model.enabled} onChange={handleToggle} />
        </Flexbox>
        <Flexbox gap={6} style={{ paddingLeft: 48 }}>
          <ModelInfoTags {...model.abilities} contextWindowTokens={model.contextWindowTokens} />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

ModelCard.displayName = 'ModelCard';

export default ModelCard;
