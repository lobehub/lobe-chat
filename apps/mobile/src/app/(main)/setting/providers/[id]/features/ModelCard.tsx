import { ModelIcon } from '@lobehub/icons-rn';
import { Flexbox, InstantSwitch, ModelInfoTags, Tag, Text, useToast } from '@lobehub/ui-rn';
import Clipboard from '@react-native-clipboard/clipboard';
import { AiProviderModelListItem } from 'model-bank';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';

import { useStyles } from '../styles';

interface ModelCardProps {
  model: AiProviderModelListItem;
  onToggle: (modelId: string, enabled: boolean) => void;
}

const ModelCard = memo<ModelCardProps>(({ model, onToggle }) => {
  const { styles } = useStyles();
  const toast = useToast();
  const { t } = useTranslation(['setting']);

  const handleToggle = (value: boolean) => {
    onToggle(model.id, value);
  };

  const handleCopyModelId = () => {
    Clipboard.setString(model.id);
    toast.success(t('aiProviders.models.copySuccess', { ns: 'setting' }));
  };

  return (
    <Flexbox style={styles.modelCard}>
      <Flexbox style={styles.modelCardContent}>
        <ModelIcon model={model.id} size={32} />
        <Flexbox style={styles.modelInfo}>
          <Flexbox style={styles.modelTopRow}>
            <Text style={styles.modelName}>{model.displayName || model.id}</Text>
            <ModelInfoTags {...model.abilities} contextWindowTokens={model.contextWindowTokens} />
          </Flexbox>
          <TouchableOpacity onPress={handleCopyModelId} style={styles.modelBottomRow}>
            <Tag style={styles.modelIdTag} textStyle={styles.modelIdText}>
              {model.id}
            </Tag>
          </TouchableOpacity>
        </Flexbox>

        <Flexbox style={styles.modelSwitchContainer}>
          <InstantSwitch
            checked={model.enabled}
            onChange={async (enabled) => {
              handleToggle(enabled);
            }}
            size="small"
          />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

ModelCard.displayName = 'ModelCard';

export default ModelCard;
