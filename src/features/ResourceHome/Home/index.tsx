'use client';

import { Flexbox } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import NavHeader from '@/features/NavHeader';
import AddButton from '@/features/ResourceManager/components/Header/AddButton';

import Libraries from './Libraries';
import RecentFiles from './RecentFiles';
import RecentPages from './RecentPages';
import RecentWorks from './RecentWorks';

const styles = stylex.create({
  content: {
    width: '100%',
    maxWidth: '1080px',
    marginInline: 'auto',
    paddingBlockStart: '32px',
    paddingBlockEnd: '64px',
    paddingInline: '32px',
  },
  scroll: { overflowX: 'hidden', overflowY: 'auto', flex: '1' },
});

/**
 * The library-style landing page of /resource: libraries (once — the sidebar
 * holds the full index), then works → recent pages → recent files, instead of
 * the flat all-files table (which now lives at /resource/all).
 */
const ResourceHomeDashboard = memo(() => {
  const { t } = useTranslation('file');

  return (
    <Flexbox height={'100%'}>
      <NavHeader
        left={<Flexbox style={{ marginLeft: 8 }}>{t('resource')}</Flexbox>}
        right={<AddButton />}
        style={{ borderBottom: `1px solid ${cssVar.colorBorderSecondary}` }}
      />
      <div {...stylex.props(styles.scroll)}>
        <Flexbox className={stylex.props(styles.content).className} gap={40}>
          <Libraries />
          <RecentWorks />
          <RecentPages />
          <RecentFiles />
        </Flexbox>
      </div>
    </Flexbox>
  );
});

ResourceHomeDashboard.displayName = 'ResourceHomeDashboard';

export default ResourceHomeDashboard;
