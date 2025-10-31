import { type DemoItem, Divider, Flexbox, Markdown, Segmented, Text } from '@lobehub/ui-rn';
import { FlashList } from '@shopify/flash-list';
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
    <FlashList
      ListHeaderComponent={
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
      }
      automaticallyAdjustContentInsets={true}
      contentInsetAdjustmentBehavior={'automatic'}
      data={[activeTab]}
      drawDistance={400}
      renderItem={({ item }) => {
        if (item === 'demo') {
          return (
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
          );
        } else {
          return (
            <Flexbox paddingInline={16}>
              <Markdown>{readmeContent}</Markdown>
            </Flexbox>
          );
        }
      }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default ComponentPlayground;
