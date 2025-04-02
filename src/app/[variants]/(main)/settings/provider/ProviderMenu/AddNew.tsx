'use client';

import { ActionIcon } from '@lobehub/ui';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CreateNewProvider from '../features/CreateNewProvider';

const AddNewProvider = () => {
  const { t } = useTranslation('modelProvider');
  const [open, setOpen] = useState(false);

  return (
    <>
      <ActionIcon
        icon={PlusIcon}
        onClick={() => setOpen(true)}
        title={t('menu.addCustomProvider')}
        variant={'block'}
      />
      <CreateNewProvider onClose={() => setOpen(false)} open={open} />
    </>
  );
};

export default AddNewProvider;
