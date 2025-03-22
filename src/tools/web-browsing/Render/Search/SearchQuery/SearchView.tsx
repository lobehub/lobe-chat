import { Icon } from '@lobehub/ui';
import { Divider, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { SearchIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';

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
    const { t } = useTranslation('tool');
    const isMobile = useIsMobile();
    const { styles } = useStyles();
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
          className={styles.query}
          gap={8}
          horizontal
          onClick={() => {
            onEditingChange(true);
          }}
        >
          <Icon icon={SearchIcon} />
          {defaultQuery}
        </Flexbox>

        <Flexbox align={'center'} horizontal>
          <div className={styles.font}>{t('search.searchEngine.title')}</div>
          {searching ? (
            <Skeleton.Button active size={'small'} />
          ) : (
            <EngineAvatarGroup engines={defaultEngines} />
          )}

          {!isMobile && (
            <>
              <Divider type={'vertical'} />
              <div className={styles.font}>{t('search.searchResult')}</div>
              {searching ? <Skeleton.Button active size={'small'} /> : resultsNumber}
            </>
          )}
        </Flexbox>
      </Flexbox>
    );
  },
);
export default SearchBar;
