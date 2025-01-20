'use client';

import { Icon, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { Loader2Icon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

import CreateNewProvider from '../../features/CreateNewProvider';

const AddNew = () => {
  const { t } = useTranslation(['modelProvider', 'subscription']);
  const [isUserStateInit, isFreePlan] = useUserStore((s) => [
    s.isUserStateInit,
    authSelectors.isFreePlan(s),
  ]);

  const [open, setOpen] = useState(false);

  if (!isUserStateInit)
    return (
      <Button
        color={'default'}
        icon={<Icon icon={Loader2Icon} spin />}
        style={{ minWidth: 36 }}
        variant={'filled'}
      />
    );

  if (isFreePlan)
    return (
      <Tooltip title={t('limitation.providers.lock.addNew', { ns: 'subscription' })}>
        <Button
          color={'default'}
          icon={<Icon icon={PlusIcon} />}
          style={{ minWidth: 36 }}
          variant={'filled'}
        />
      </Tooltip>
    );

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

export default AddNew;
