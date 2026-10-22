'use client';

import { Flexbox, Spin } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';

const styles = stylex.create({
  title: { margin: '0', fontSize: '15px', fontWeight: 600, color: cssVar.colorText },
  viewAll: {
    cursor: 'pointer',
    borderStyle: 'none',
    fontSize: '13px',
    color: { 'default': cssVar.colorTextSecondary, ':hover': cssVar.colorText },
    backgroundColor: 'transparent',
    backgroundImage: 'none',
  },
});

interface SectionTitleProps {
  /** The cards are the local copy and a refresh is in flight. */
  loading?: boolean;
  title: string;
  /** Target path of the "view all" affordance; omitted when there is no fuller view. */
  viewAllUrl?: string;
}

const SectionTitle = memo<SectionTitleProps>(({ loading, title, viewAllUrl }) => {
  const { t } = useTranslation('file');
  const navigate = useWorkspaceAwareNavigate();

  return (
    <Flexbox horizontal align={'center'} justify={'space-between'}>
      <Flexbox horizontal align={'center'} gap={8}>
        <h2 {...stylex.props(styles.title)}>{title}</h2>
        {loading && <Spin size="small" variant="network" />}
      </Flexbox>
      {viewAllUrl && (
        <button
          {...stylex.props(styles.viewAll)}
          type={'button'}
          onClick={() => navigate(viewAllUrl)}
        >
          {t('home.viewAll')}
        </button>
      )}
    </Flexbox>
  );
});

SectionTitle.displayName = 'SectionTitle';

export default SectionTitle;
