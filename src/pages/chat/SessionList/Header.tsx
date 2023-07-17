import { ActionIcon, Logo, SearchBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { MessageSquarePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

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

const Header = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('common');
  const [keywords, createSession] = useSessionStore(
    (s) => [s.searchKeywords, s.createSession],
    shallow,
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
