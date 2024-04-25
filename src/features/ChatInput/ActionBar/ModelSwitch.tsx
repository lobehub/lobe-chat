import { ActionIcon } from '@lobehub/ui';
import { useWhyDidYouUpdate } from 'ahooks';
import { BrainCog } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ModelSwitchPanel from '@/features/ModelSwitchPanel';

const ModelSwitch = memo(() => {
  const { t, ...res } = useTranslation('chat');

  useWhyDidYouUpdate('Trans', { res, t });
  return (
    <ModelSwitchPanel>
      <ActionIcon icon={BrainCog} placement={'bottom'} title={t('ModelSwitch.title')} />
    </ModelSwitchPanel>
  );
});

ModelSwitch.displayName = 'ModelSwitch';

export default ModelSwitch;
