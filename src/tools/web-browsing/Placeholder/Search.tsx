import { Icon } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { SearchIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { shinyTextStylish } from '@/styles/loading';

const ITEM_HEIGHT = 80;
const ITEM_WIDTH = 160;

const useStyles = createStyles(({ css, token, cx }) => ({
  query: cx(
    css`
      padding-block: 4px;
      padding-inline: 8px;
      border-radius: 8px;

      font-size: 12px;
      color: ${token.colorTextSecondary};

      &:hover {
        background: ${token.colorFillTertiary};
      }
    `,
    shinyTextStylish(token),
  ),
}));

interface SearchProps {
  query?: string;
}
export const Search = memo<SearchProps>(({ query }) => {
  const isMobile = useIsMobile();
  const { styles } = useStyles();
  return (
    <Flexbox gap={8}>
      <Flexbox
        align={isMobile ? 'flex-start' : 'center'}
        distribution={'space-between'}
        gap={isMobile ? 8 : 40}
        height={isMobile ? undefined : 32}
        horizontal={!isMobile}
      >
        <Flexbox align={'center'} className={styles.query} gap={8} horizontal>
          <Icon icon={SearchIcon} />
          {query ? query : <Skeleton.Node active style={{ height: 20, width: 40 }} />}
        </Flexbox>

        <Skeleton.Node active style={{ height: 20, width: 40 }} />
      </Flexbox>
      <Flexbox gap={12} horizontal>
        {['1', '2', '3', '4', '5'].map((id) => (
          <Skeleton.Button
            active
            key={id}
            style={{ borderRadius: 8, height: ITEM_HEIGHT, width: ITEM_WIDTH }}
          />
        ))}
      </Flexbox>
    </Flexbox>
  );
});
