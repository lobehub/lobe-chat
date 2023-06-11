import { PlusOutlined } from '@ant-design/icons';
import { SearchBar } from '@lobehub/ui';
import { Button, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useChatStore } from '@/store/session';

export const useStyles = createStyles(({ css }) => ({
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
    <Flexbox gap={16} padding={'16px 8px 0'} className={styles.top}>
      <Flexbox horizontal distribution={'space-between'}>
        <div>LobeHub</div>
        <Tooltip arrow={false} title={'新对话'} placement={'right'}>
          <Button icon={<PlusOutlined />} style={{ minWidth: 32 }} onClick={createSession} />
        </Tooltip>
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
