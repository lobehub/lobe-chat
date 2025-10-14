import { type DemoItem, Divider, Flexbox, Markdown, Segmented, Text } from '@lobehub/ui-rn';
import { BookOpen, Code2 } from 'lucide-react-native';
import { Fragment, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';

type TabName = 'demo' | 'readme';

export interface ComponentPlaygroundProps {
  demos: DemoItem[];
  readmeContent: string;
}

const ComponentPlayground = ({ demos, readmeContent }: ComponentPlaygroundProps) => {
  const containerRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<TabName>('demo');
  const { width } = useWindowDimensions();

  return (
    <Flexbox flex={1}>
      {/* 固定的 Segmented */}
      <Flexbox paddingBlock={8} paddingInline={16}>
        <Segmented
          block
          onChange={(value) => {
            const tabName = value as TabName;
            setActiveTab(tabName);
            containerRef.current?.jumpToTab(tabName);
          }}
          options={[
            { icon: Code2, label: '演示', value: 'demo' },
            { icon: BookOpen, label: '文档', value: 'readme' },
          ]}
          value={activeTab}
        />
      </Flexbox>

      {/* 可滑动的标签内容 */}
      <Tabs.Container
        lazy
        onIndexChange={(index) => {
          setActiveTab(index === 0 ? 'demo' : 'readme');
        }}
        ref={containerRef}
        renderTabBar={() => null}
        width={width}
      >
        <Tabs.Tab name="demo">
          <Tabs.Lazy>
            <Tabs.ScrollView showsVerticalScrollIndicator={false}>
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
            </Tabs.ScrollView>
          </Tabs.Lazy>
        </Tabs.Tab>

        <Tabs.Tab name="readme">
          <Tabs.Lazy>
            <Tabs.ScrollView showsVerticalScrollIndicator={false}>
              <Flexbox paddingInline={16}>
                <Markdown>{readmeContent}</Markdown>
              </Flexbox>
            </Tabs.ScrollView>
          </Tabs.Lazy>
        </Tabs.Tab>
      </Tabs.Container>
    </Flexbox>
  );
};

export default ComponentPlayground;
