'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Mobile from './_layout/Mobile';

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
 * Mobile Changelog Page
 */
export const MobileChangelogPage = memo(() => {
  return (
    <Mobile>
      <ChangelogContent />
    </Mobile>
  );
});

MobileChangelogPage.displayName = 'MobileChangelogPage';
