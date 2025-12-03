import { Empty, Segmented } from 'antd';
import { Calendar, List } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserMemoryStore } from '@/store/userMemory';

import FilterBar, { IdentityType } from './FilterBar';
import ListView from './ListView';
import RoleTagCloud from './RoleTagCloud';
import TimelineView from './TimelineView';

type ViewMode = 'list' | 'timeline';

const IdentitiesList = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('memory');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState<IdentityType>('all');
  const { data: identities, isLoading } = useUserMemoryStore((s) => s.useFetchIdentities());

  const filteredIdentities = useMemo(() => {
    if (!identities) return [];

    let filtered = identities;

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
        const labels = (
          Array.isArray(identity.extractedLabels) ? identity.extractedLabels.join(' ') : ''
        ).toLowerCase();

        return (
          role.includes(searchLower) ||
          relationship.includes(searchLower) ||
          description.includes(searchLower) ||
          labels.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [identities, typeFilter, searchValue]);

  const sortedRoles = useMemo(() => {
    if (!filteredIdentities) return [];

    const allRoles = filteredIdentities.reduce((acc, identity) => {
      if (identity.role) {
        if (!acc.has(identity.role)) {
          acc.set(identity.role, 0);
        }
        acc.set(identity.role, acc.get(identity.role)! + 1);
      }
      return acc;
    }, new Map<string, number>());

    return Array.from(allRoles.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([role]) => role);
  }, [filteredIdentities]);

  if (isLoading) return <div>{t('loading')}</div>;

  if (!identities || identities.length === 0) {
    return <Empty description={t('identity.empty')} />;
  }

  return (
    <Flexbox gap={16}>
      <Flexbox align="center" gap={16} horizontal justify="space-between">
        <FilterBar
          onSearchChange={setSearchValue}
          onTypeChange={setTypeFilter}
          searchValue={searchValue}
          typeValue={typeFilter}
        />
        <Segmented
          onChange={(value) => setViewMode(value as ViewMode)}
          options={[
            { icon: <Calendar size={16} />, label: t('identity.view.timeline'), value: 'timeline' },
            { icon: <List size={16} />, label: t('identity.view.list'), value: 'list' },
          ]}
          value={viewMode}
        />
      </Flexbox>

      {viewMode === 'timeline' && <RoleTagCloud roles={sortedRoles} />}

      {filteredIdentities.length === 0 ? (
        <Empty description={t('identity.list.noResults')} />
      ) : viewMode === 'timeline' ? (
        <TimelineView identities={filteredIdentities} />
      ) : (
        <ListView identities={filteredIdentities} mobile={mobile} />
      )}
    </Flexbox>
  );
});

export default IdentitiesList;
