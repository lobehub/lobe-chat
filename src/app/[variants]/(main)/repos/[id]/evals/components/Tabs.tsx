'use client';

import { TabsNav } from '@lobehub/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Tabs = ({ knowledgeBaseId }: { knowledgeBaseId: string }) => {
  const pathname = usePathname();

  const key = pathname.split('/').pop();

  return (
    <TabsNav
      activeKey={key}
      items={[
        {
          key: 'dataset',
          label: (
            <Link href={`/repos/${knowledgeBaseId}/evals/dataset`} style={{ color: 'initial' }}>
              数据集
            </Link>
          ),
        },
        {
          key: 'evaluation',
          label: (
            <Link href={`/repos/${knowledgeBaseId}/evals/evaluation`} style={{ color: 'initial' }}>
              评测任务
            </Link>
          ),
        },
      ]}
    />
  );
};
