'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

/**
 * Changelog content placeholder
 * TODO: Implement client-side data fetching for changelog
 */
const ChangelogContent = memo(() => {
  return (
    <Flexbox gap={16}>
      <h1>Changelog</h1>
      <p>Changelog content will be loaded here...</p>
    </Flexbox>
  );
});

ChangelogContent.displayName = 'ChangelogContent';

export default ChangelogContent;
