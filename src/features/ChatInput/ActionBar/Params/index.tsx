import { ActionIcon } from '@lobehub/ui';
import { SlidersHorizontal } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionPopover from '../../components/ActionPopover';
import ParamsControls from './ParamsControls';

const Params = memo(() => {
  const { t } = useTranslation('setting');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isUpdating, setUpdating] = useState(false);

  return (
    <ActionPopover
      content={<ParamsControls setUpdating={setUpdating} />}
      loading={isUpdating}
      minWidth={400}
      onOpenChange={setPopoverOpen}
      open={popoverOpen}
      title={t('settingModel.params.title')}
    >
      <ActionIcon
        icon={SlidersHorizontal}
        title={t('settingModel.params.title')}
        tooltipProps={{
          placement: 'bottom',
        }}
      />
    </ActionPopover>
  );
});

export default Params;
