import { ActionIcon, Logo, MobileNavBar, SearchBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import AvatarWithUpload from '@/features/AvatarWithUpload';
import { useSessionStore } from '@/store/session';

export const useStyles = createStyles(({ css, token }) => ({
  logo: css`
    fill: ${token.colorText};
  `,
  top: css`
    position: sticky;
    top: 0;
  `,
}));

const Header = memo<{ mobile?: 'navbar' | 'search' }>(({ mobile }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('common');
  const [keywords, createSession] = useSessionStore((s) => [s.searchKeywords, s.createSession]);

  if (mobile === 'navbar') {
    return (
      <MobileNavBar
        center={<Logo type={'text'} />}
        left={<AvatarWithUpload size={28} style={{ marginLeft: 8 }} />}
        right={<ActionIcon icon={MessageSquarePlus} onClick={createSession} />}
      />
    );
  }

  if (mobile === 'search')
    return (
      <Flexbox className={styles.top} padding={16}>
        <SearchBar
          allowClear
          onChange={(e) => useSessionStore.setState({ searchKeywords: e.target.value })}
          placeholder={t('searchAgentPlaceholder')}
          type={'block'}
          value={keywords}
        />
      </Flexbox>
    );

  return (
    <Flexbox className={styles.top} gap={16} padding={16}>
      <Flexbox distribution={'space-between'} horizontal>
        <Link href={'/'}>
          <Logo className={styles.logo} size={36} type={'text'} />
        </Link>
        <ActionIcon
          icon={MessageSquarePlus}
          onClick={createSession}
          size={{ fontSize: 24 }}
          style={{ flex: 'none' }}
          title={t('newAgent')}
        />
      </Flexbox>
      <SearchBar
        allowClear
        onChange={(e) => useSessionStore.setState({ searchKeywords: e.target.value })}
        placeholder={t('searchAgentPlaceholder')}
        spotlight
        type={'ghost'}
        value={keywords}
      />
    </Flexbox>
  );
});

export default Header;
