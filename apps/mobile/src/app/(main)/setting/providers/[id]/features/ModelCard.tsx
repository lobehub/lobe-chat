import { ModelIcon } from '@lobehub/icons-rn';
import { Cell, Flexbox, InstantSwitch, ModelInfoTags, Text } from '@lobehub/ui-rn';
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
    <Cell
      description={
        <Flexbox gap={6}>
          <Text code ellipsis fontSize={12} type={'secondary'}>
            {model.id}
          </Text>
          <ModelInfoTags {...model.abilities} contextWindowTokens={model.contextWindowTokens} />
        </Flexbox>
      }
      extra={<InstantSwitch checked={model.enabled} onChange={handleToggle} />}
      icon={<ModelIcon model={model.id} size={44} />}
      iconSize={44}
      showArrow={false}
      title={model.displayName || model.id}
      titleProps={{
        fontSize: 14,
        weight: 500,
      }}
    />
  );
});

ModelCard.displayName = 'ModelCard';

export default ModelCard;
