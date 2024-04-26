import { MobileNavBar } from '@lobehub/ui';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';

import { featureFlagsSelectors, useFeatureFlagStore } from '@/store/featureFlags';

import SettingButton from '../../../features/SettingButton';
import ShareButton from '../../../features/ShareButton';
import ChatHeaderTitle from './ChatHeaderTitle';

const MobileHeader = memo(() => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { isAgentEditable } = useFeatureFlagStore(featureFlagsSelectors);

  // const items: MenuProps['items'] = [
  //   {
  //     icon: <Icon icon={Share2} />,
  //     key: 'share',
  //     label: t('share', { ns: 'common' }),
  //     onClick: () => setOpen(true),
  //   },
  //   !isInbox && {
  //     icon: <Icon icon={Settings} />,
  //     key: 'settings',
  //     label: t('header.session', { ns: 'setting' }),
  //     onClick: () => router.push(pathString('/chat/settings', { hash: location.hash })),
  //   },
  // ].filter(Boolean) as MenuProps['items'];

  return (
    <MobileNavBar
      center={<ChatHeaderTitle />}
      onBackClick={() => router.push('/chat')}
      right={
        <>
          <ShareButton mobile open={open} setOpen={setOpen} />
          {isAgentEditable && <SettingButton mobile />}
          {/*<Dropdown*/}
          {/*  menu={{*/}
          {/*    items,*/}
          {/*  }}*/}
          {/*  trigger={['click']}*/}
          {/*>*/}
          {/*  <ActionIcon icon={MoreHorizontal} />*/}
          {/*</Dropdown>*/}
        </>
      }
      showBackButton
    />
  );
});

export default MobileHeader;
