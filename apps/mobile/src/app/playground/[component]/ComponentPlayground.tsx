import {
  type DemoItem,
  Divider,
  Flexbox,
  Markdown,
  Segmented,
  TabView,
  Text,
} from '@lobehub/ui-rn';
import { BookOpen, Code2 } from 'lucide-react-native';
import { Fragment, useState } from 'react';

type TabName = 'demo' | 'readme';

export interface ComponentPlaygroundProps {
  demos: DemoItem[];
  readmeContent: string;
}

const ComponentPlayground = ({ demos, readmeContent }: ComponentPlaygroundProps) => {
  const [activeTab, setActiveTab] = useState<TabName>('demo');

  return (
    <Flexbox flex={1}>
      {/* 固定的 Segmented */}
      <Flexbox paddingBlock={8} paddingInline={16}>
        <Segmented
          block
          onChange={(value) => setActiveTab(value as TabName)}
          options={[
            { icon: Code2, label: '演示', value: 'demo' },
            { icon: BookOpen, label: '文档', value: 'readme' },
          ]}
          value={activeTab}
        />
      </Flexbox>
      <TabView
        items={[
          {
            children: (
              <Flexbox>
                {demos.map((demo, index) => (
                  <Fragment key={demo.key}>
                    <Flexbox gap={8} padding={16}>
                      <Text type={'secondary'}>{demo.title}</Text>
                      <Flexbox align={'stretch'}>{demo.component}</Flexbox>
                    </Flexbox>
                    {index < demos.length - 1 && <Divider />}
                  </Fragment>
                ))}
              </Flexbox>
            ),
            key: 'demo',
          },
          {
            children: (
              <Flexbox paddingInline={16}>
                <Markdown>{readmeContent}</Markdown>
              </Flexbox>
            ),
            key: 'readme',
          },
        ]}
        onChange={(v) => setActiveTab(v as TabName)}
        value={activeTab}
      />
    </Flexbox>
  );
};

export default ComponentPlayground;
