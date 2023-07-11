import { ActionIcon, Logo, SearchBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useChatStore } from '@/store/session';
import Link from 'next/link';

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

  const [keywords, createSession] = useChatStore((s) => [s.searchKeywords, s.createSession], shallow);

  return (
    <Flexbox gap={16} padding={'16px 12px 0 16px'} className={styles.top}>
      <Flexbox horizontal distribution={'space-between'}>
        <Link href={'/'}>
          <Logo type={'text'} size={36} className={styles.logo} />
        </Link>
        <ActionIcon title={'新对话'} icon={Plus} style={{ minWidth: 32 }} onClick={createSession} />
      </Flexbox>
      <SearchBar
        allowClear
        value={keywords}
        placeholder="Search..."
        type={'block'}
        onChange={(e) => useChatStore.setState({ searchKeywords: e.target.value })}
      />
    </Flexbox>
  );
});

export default Header;
