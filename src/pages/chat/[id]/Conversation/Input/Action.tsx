import { ActionIcon } from '@lobehub/ui';
import { Popconfirm } from 'antd';
import { BrainCog, Eraser, Thermometer, Timer } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { useSessionStore } from '@/store/session';

const InputActions = memo(() => {
  const { t } = useTranslation('setting');
  const [clearMessage] = useSessionStore((s) => [s.clearMessage], shallow);

  return (
    <>
      <ActionIcon icon={BrainCog} title={t('settingModel.model.title')} />
      <ActionIcon icon={Thermometer} title={t('settingModel.temperature.title')} />
      <ActionIcon icon={Timer} title={t('settingChat.historyCount.title')} />
      <Popconfirm
        cancelText={t('cancel', { ns: 'common' })}
        okButtonProps={{ danger: true }}
        okText={t('ok', { ns: 'common' })}
        onConfirm={() => clearMessage()}
        title={t('confirmClearCurrentMessages', { ns: 'common' })}
      >
        <ActionIcon icon={Eraser} title={t('clearCurrentMessages', { ns: 'common' })} />
      </Popconfirm>
    </>
  );
});

export default InputActions;
