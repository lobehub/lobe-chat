import { ActionIcon } from '@lobehub/ui';
import { Popover } from 'antd';
import { useTheme } from 'antd-style';
import { SlidersHorizontal } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import UpdateLoading from '@/components/Loading/UpdateLoading';
import { useIsMobile } from '@/hooks/useIsMobile';

import ParamsControls from './ParamsControls';

const Params = memo(() => {
  const { t } = useTranslation('setting');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isUpdating, setUpdating] = useState(false);

  const theme = useTheme();
  const isMobile = useIsMobile();
  return (
    <Popover
      arrow={false}
      content={<ParamsControls setUpdating={setUpdating} />}
      onOpenChange={setPopoverOpen}
      open={popoverOpen}
      placement={'top'}
      styles={{
        body: {
          minWidth: isMobile ? undefined : 400,
          width: isMobile ? '100vw' : undefined,
        },
      }}
      title={
        <Flexbox horizontal justify={'space-between'}>
          {t('settingModel.params.title')}

          {isUpdating && <UpdateLoading style={{ color: theme.colorTextSecondary }} />}
        </Flexbox>
      }
      trigger={'click'}
    >
      <ActionIcon
        icon={SlidersHorizontal}
        placement={'bottom'}
        title={popoverOpen ? undefined : t('settingModel.params.title')}
      />
    </Popover>
  );
});

export default Params;
