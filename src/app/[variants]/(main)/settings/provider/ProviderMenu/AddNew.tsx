'use client';

import { Icon, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CreateNewProvider from '../features/CreateNewProvider';

const AddNewProvider = () => {
  const { t } = useTranslation('modelProvider');
  const [open, setOpen] = useState(false);

  return (
    <Tooltip title={t('menu.addCustomProvider')}>
      <Button
        color={'default'}
        icon={<Icon icon={PlusIcon} />}
        onClick={() => setOpen(true)}
        variant={'filled'}
      />
      <CreateNewProvider onClose={() => setOpen(false)} open={open} />
    </Tooltip>
  );
};

export default AddNewProvider;
