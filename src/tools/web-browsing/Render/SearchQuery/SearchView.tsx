import { EditableText } from '@lobehub/ui';
import { Divider, Skeleton, Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';

import { EngineAvatarGroup } from '../../components/EngineAvatar';

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

    return (
      <Flexbox
        align={isMobile ? 'flex-start' : 'center'}
        distribution={'space-between'}
        gap={isMobile ? 8 : 40}
        height={isMobile ? undefined : 32}
        horizontal={!isMobile}
      >
        <Flexbox align={'center'} gap={4} horizontal>
          <Typography.Text style={{ minWidth: 60 }} type={'secondary'}>
            {t('search.keywords')}
          </Typography.Text>
          <EditableText onEditingChange={onEditingChange} value={defaultQuery} />
        </Flexbox>

        <Flexbox align={'center'} horizontal>
          <Typography.Text type={'secondary'}>{t('search.searchEngine')}</Typography.Text>
          {searching ? (
            <Skeleton.Button active size={'small'} />
          ) : (
            <EngineAvatarGroup engines={defaultEngines} />
          )}

          {!isMobile && (
            <>
              <Divider type={'vertical'} />
              <Typography.Text type={'secondary'}>{t('search.searchResult')}</Typography.Text>
              {searching ? <Skeleton.Button active size={'small'} /> : resultsNumber}
            </>
          )}
        </Flexbox>
      </Flexbox>
    );
  },
);
export default SearchBar;
