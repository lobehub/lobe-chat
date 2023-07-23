import { ActionIcon } from '@lobehub/ui';
import { Popconfirm } from 'antd';
import { Eraser, Languages } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { useSessionStore } from '@/store/session';

const InputActions = memo(() => {
  const { t } = useTranslation();
  const [clearMessage] = useSessionStore((s) => [s.clearMessage], shallow);

  return (
    <>
      <ActionIcon icon={Languages} />
      <Popconfirm onConfirm={() => clearMessage()} title={t('confirmClearCurrentMessages')}>
        <ActionIcon icon={Eraser} title={t('clearCurrentMessages')} />
      </Popconfirm>
    </>
  );
});

export default InputActions;
