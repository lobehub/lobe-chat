import { ActionIcon, Logo, MobileNavBar } from '@lobehub/ui';
import { Settings2 } from 'lucide-react';
import Router from 'next/router';
import { memo } from 'react';

import AvatarWithUpload from '@/features/AvatarWithUpload';

const Header = memo(() => {
  return (
    <MobileNavBar
      center={<Logo type={'text'} />}
      left={<AvatarWithUpload size={28} style={{ marginLeft: 8 }} />}
      right={
        <ActionIcon
          icon={Settings2}
          onClick={() => {
            Router.push({ pathname: `/settings` });
          }}
        />
      }
    />
  );
});

export default Header;
