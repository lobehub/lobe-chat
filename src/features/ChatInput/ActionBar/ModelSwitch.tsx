import { ActionIcon } from '@lobehub/ui';
import { BrainCog } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ModelSwitchPanel from '@/features/ModelSwitchPanel';

const ModelSwitch = memo(() => {
  const { t } = useTranslation('chat');

  return (
    <ModelSwitchPanel>
      <ActionIcon icon={BrainCog} placement={'bottom'} title={t('ModelSwitch.title')} />
    </ModelSwitchPanel>
  );
});

export default ModelSwitch;
