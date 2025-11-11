'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Desktop from './_layout/Desktop';

/**
 * Changelog content placeholder
 * TODO: Implement client-side data fetching for changelog
 */
const ChangelogContent = memo(() => {
  return (
    <Flexbox gap={16} padding={24}>
      <h1>Changelog</h1>
      <p>Changelog content will be loaded here...</p>
    </Flexbox>
  );
});

ChangelogContent.displayName = 'ChangelogContent';

/**
 * Desktop Changelog Page
 */
export const DesktopChangelogPage = memo(() => {
  return (
    <Desktop>
      <ChangelogContent />
    </Desktop>
  );
});

DesktopChangelogPage.displayName = 'DesktopChangelogPage';
