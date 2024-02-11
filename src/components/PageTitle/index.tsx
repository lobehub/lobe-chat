import { memo, useEffect } from 'react';

const PageTitle = memo<{ title: string }>(({ title }) => {
  useEffect(() => {
    document.title = title ? `${title} · Ai Fensch Tech` : 'Ai Fensch Tech';
  }, [title]);

  return null;
});

export default PageTitle;
