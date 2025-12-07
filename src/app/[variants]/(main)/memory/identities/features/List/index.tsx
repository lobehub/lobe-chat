import { Empty } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { UserMemoryIdentityWithoutVectors } from '@/types/userMemory';

import ListView from './ListView';
import TimelineView from './TimelineView';

export type ViewMode = 'list' | 'timeline';
export type IdentityType = 'all' | 'demographic' | 'personal' | 'professional';

interface IdentitiesListProps {
  data: UserMemoryIdentityWithoutVectors[];
  searchValue: string;
  typeFilter: IdentityType;
  viewMode: ViewMode;
}

const IdentitiesList = memo<IdentitiesListProps>(({ data, viewMode, typeFilter, searchValue }) => {
  const { t } = useTranslation('memory');

  const filteredIdentities = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((identity) => identity.type === typeFilter);
    }

    // Search filter
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter((identity) => {
        const role = identity.role?.toLowerCase() || '';
        const relationship = identity.relationship?.toLowerCase() || '';
        const description = identity.description?.toLowerCase() || '';
        const labels = (Array.isArray(identity.tags) ? identity.tags.join(' ') : '').toLowerCase();

        return (
          role.includes(searchLower) ||
          relationship.includes(searchLower) ||
          description.includes(searchLower) ||
          labels.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [data, typeFilter, searchValue]);

  if (!data || data.length === 0) return <Empty description={t('identity.empty')} />;

  if (filteredIdentities.length === 0) return <Empty description={t('identity.list.noResults')} />;

  if (viewMode === 'timeline') return <TimelineView identities={filteredIdentities} />;

  return <ListView identities={filteredIdentities} />;
});

export default IdentitiesList;
