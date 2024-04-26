import { ActionIcon, Avatar, Logo, MobileNavBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { MessageSquarePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import SyncStatusInspector from '@/features/SyncStatusInspector';
import { useGlobalStore } from '@/store/global';
import { commonSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

export const useStyles = createStyles(({ css, token }) => ({
  logo: css`
    fill: ${token.colorText};
  `,
  top: css`
    position: sticky;
    top: 0;
  `,
}));

const Header = memo(() => {
  const [createSession] = useSessionStore((s) => [s.createSession]);
  const router = useRouter();
  const avatar = useGlobalStore(commonSelectors.userAvatar);
  return (
    <MobileNavBar
      left={
        <Flexbox align={'center'} gap={8} horizontal style={{ marginLeft: 8 }}>
          <div onClick={() => router.push('/settings')}>
            {avatar ? <Avatar avatar={avatar} size={28} /> : <Logo size={28} />}
          </div>
          <Logo type={'text'} />
          <SyncStatusInspector placement={'bottom'} />
        </Flexbox>
      }
      right={
        <ActionIcon
          icon={MessageSquarePlus}
          onClick={() => createSession()}
          size={MOBILE_HEADER_ICON_SIZE}
        />
      }
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
