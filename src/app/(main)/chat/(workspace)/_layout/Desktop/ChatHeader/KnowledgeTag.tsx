'use client';

import { Icon, Tag } from '@lobehub/ui';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { LibraryBig } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import KnowledgeIcon from '@/components/KnowledgeIcon';
import { KnowledgeItem } from '@/types/knowledgeBase';

export interface PluginTagProps {
  data: KnowledgeItem[];
}

const PluginTag = memo<PluginTagProps>(({ data }) => {
  if (data.length === 0) return null;

  const items: MenuProps['items'] = data.map((item) => ({
    icon: <KnowledgeIcon fileType={item.fileType} name={item.name} type={item.type} />,
    key: item.id,
    label: <Flexbox style={{ paddingInlineStart: 8 }}>{item.name}</Flexbox>,
  }));

  const count = data.length;

  return (
    <Dropdown menu={{ items }}>
      <div>
        <Tag>
          {<Icon icon={LibraryBig} />}
          {data[0].name}
          {count > 1 && <div>({data.length - 1}+)</div>}
        </Tag>
      </div>
    </Dropdown>
  );
});

export default PluginTag;
