import { ActionIcon } from '@lobehub/ui';
import { Popover } from 'antd';
import { Settings2Icon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';

import ControlsForm from './ControlsForm';

const ExtendControls = memo(() => {
  const { t } = useTranslation('chat');

  const isMobile = useIsMobile();
  return (
    <Flexbox style={{ marginInlineStart: -4 }}>
      <Popover
        arrow={false}
        content={<ControlsForm />}
        open
        styles={{
          body: {
            minWidth: isMobile ? undefined : 250,
            width: isMobile ? '100vw' : undefined,
          },
        }}
      >
        <ActionIcon
          icon={Settings2Icon}
          placement={'bottom'}
          style={{ borderRadius: 20 }}
          title={t('extendControls.title')}
        />
      </Popover>
    </Flexbox>
  );
});

export default ExtendControls;
