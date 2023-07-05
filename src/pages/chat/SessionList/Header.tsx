import { ActionIcon, Logo, SearchBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { MessageSquarePlus } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useChatStore } from '@/store/session';

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

  const [keywords, createSession] = useChatStore(
    (s) => [s.searchKeywords, s.createSession],
    shallow,
  );

  return (
    <Flexbox className={styles.top} gap={16} padding={'16px 12px 0 16px'}>
      <Flexbox distribution={'space-between'} horizontal>
        <Logo className={styles.logo} size={36} type={'text'} />
        <ActionIcon
          icon={MessageSquarePlus}
          onClick={createSession}
          style={{ minWidth: 32 }}
          title={'新对话'}
        />
      </Flexbox>
      <SearchBar
        allowClear
        enableShortKey
        onChange={(e) => useChatStore.setState({ searchKeywords: e.target.value })}
        placeholder="Search..."
        shortKey="f"
        spotlight
        type="ghost"
        value={keywords}
      />
    </Flexbox>
  );
});

export default Header;
