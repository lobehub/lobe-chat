import { Icon, Text } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { SearchIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { shinyTextStylish } from '@/styles/loading';

import { EngineAvatarGroup } from '../../../components/EngineAvatar';

const useStyles = createStyles(({ css, token }) => ({
  font: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  query: css`
    cursor: pointer;

    padding-block: 4px;
    padding-inline: 8px;
    border-radius: 8px;

    font-size: 12px;
    color: ${token.colorTextSecondary};

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  shinyText: shinyTextStylish(token),
}));

interface SearchBarProps {
  defaultEngines: string[];
  defaultQuery: string;
  onEditingChange: (editing: boolean) => void;
  resultsNumber: number;
  searching?: boolean;
}

const SearchBar = memo<SearchBarProps>(
  ({ defaultEngines, defaultQuery, resultsNumber, onEditingChange, searching }) => {
    const isMobile = useIsMobile();
    const { styles, cx } = useStyles();
    return (
      <Flexbox
        align={isMobile ? 'flex-start' : 'center'}
        distribution={'space-between'}
        gap={isMobile ? 8 : 40}
        height={isMobile ? undefined : 32}
        horizontal={!isMobile}
      >
        <Flexbox
          align={'center'}
          className={cx(styles.query, searching && styles.shinyText)}
          gap={8}
          horizontal
          onClick={() => {
            onEditingChange(true);
          }}
        >
          <Icon icon={SearchIcon} />
          {defaultQuery}
        </Flexbox>

        {searching ? (
          <Skeleton.Node active style={{ height: 20, width: 40 }} />
        ) : (
          <Flexbox align={'center'} horizontal>
            <EngineAvatarGroup engines={defaultEngines} />
            {!isMobile && (
              <Text style={{ fontSize: 12 }} type={'secondary'}>
                {resultsNumber}
              </Text>
            )}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);
export default SearchBar;
