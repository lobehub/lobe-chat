import { ActionIcon } from '@lobehub/ui';
import { Popconfirm } from 'antd';
import { useResponsive } from 'antd-style';
import { Eraser } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

import SaveTopic from '../Footer/SaveTopic';

const ActionsRight = memo(() => {
  const { t } = useTranslation('setting');
  const [clearMessage] = useSessionStore((s) => [s.clearMessage, s.updateAgentConfig]);
  const { mobile } = useResponsive();
  return (
    <>
      {mobile && <SaveTopic />}
      <Popconfirm
        cancelText={t('cancel', { ns: 'common' })}
        okButtonProps={{ danger: true }}
        okText={t('ok', { ns: 'common' })}
        onConfirm={() => clearMessage()}
        placement={'topRight'}
        title={t('confirmClearCurrentMessages', { ns: 'common' })}
      >
        <ActionIcon
          icon={Eraser}
          placement={'bottom'}
          title={t('clearCurrentMessages', { ns: 'common' })}
        />
      </Popconfirm>
    </>
  );
});

export default ActionsRight;
