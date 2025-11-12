import { memo, useEffect } from 'react';

import { BRANDING_NAME } from '@/const/branding';

const PageTitle = memo<{ title: string }>(({ title }) => {
  useEffect(() => {
    // 如果标题是"AI对话"，只显示"AI对话"，不添加品牌名称
    if (title === 'AI对话') {
      document.title = 'AI对话';
    } else {
      document.title = title ? `${title} · ${BRANDING_NAME}` : BRANDING_NAME;
    }
  }, [title]);

  return null;
});

export default PageTitle;
