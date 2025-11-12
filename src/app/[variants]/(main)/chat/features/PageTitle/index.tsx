'use client';

import { memo } from 'react';

import PageTitle from '@/components/PageTitle';
import { withSuspense } from '@/components/withSuspense';

const Title = memo(() => {
  // 固定显示"AI对话"，不显示任何动态标题以保护隐私
  // 避免在浏览器标签页和浏览历史中显示AI生成的话题标题或代理标题
  return <PageTitle title="AI对话" />;
});

export default withSuspense(Title);
