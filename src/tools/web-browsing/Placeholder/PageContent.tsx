'use client';

import { memo } from 'react';

import LoadingCard from '../Render/PageContent/Loading';

const PageContent = memo<{ url: string }>(({ url }) => {
  return <LoadingCard url={url} />;
});

export default PageContent;
