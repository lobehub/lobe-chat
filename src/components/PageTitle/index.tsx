import { memo, useEffect } from 'react';

import { BRANDING_NAME } from '@/const/branding';

const PageTitle = memo<{ title: string }>(({ title }) => {
  useEffect(() => {
    document.title = title ? `${title} · ${BRANDING_NAME}` : BRANDING_NAME;
  }, [title]);

  return null;
});

export default PageTitle;
