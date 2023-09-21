import { ActionIcon, Logo, MobileNavBar } from '@lobehub/ui';
import { Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

import AvatarWithUpload from '@/features/AvatarWithUpload';

const Header = memo(() => {
  const router = useRouter();

  return (
    <MobileNavBar
      center={<Logo type={'text'} />}
      left={<AvatarWithUpload size={28} style={{ marginLeft: 8 }} />}
      right={
        <ActionIcon
          icon={Settings2}
          onClick={() => {
            router.push('/settings');
          }}
        />
      }
    />
  );
});

export default Header;
