import { ActionIcon } from '@lobehub/ui';
import { Book, Github, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import UserPanel from '@/app/(main)/@nav/features/UserPanel';
import { DOCUMENTS, GITHUB } from '@/const/url';
import { SidebarTabKey } from '@/store/global/initialState';

export interface BottomActionProps {
  tab?: SidebarTabKey;
}

const BottomActions = memo<BottomActionProps>(({ tab }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <Link aria-label={'GitHub'} href={GITHUB} target={'_blank'}>
        <ActionIcon icon={Github} placement={'right'} title={'GitHub'} />
      </Link>
      <Link aria-label={t('document')} href={DOCUMENTS} target={'_blank'}>
        <ActionIcon icon={Book} placement={'right'} title={t('document')} />
      </Link>
      <UserPanel bottom>
        <ActionIcon active={tab === SidebarTabKey.Setting} icon={Settings2} />
      </UserPanel>
    </>
  );
});

export default BottomActions;
