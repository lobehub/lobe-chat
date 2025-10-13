import { type DemoItem, Divider, Flexbox, Markdown, Text } from '@lobehub/ui-rn';
import { BookOpen, Code2 } from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

import { useStyles } from './style';

type TabType = 'demo' | 'readme';

export interface ComponentPlaygroundProps {
  demos: DemoItem[];
  readmeContent: string;
}

const ComponentPlayground = ({ demos, readmeContent }: ComponentPlaygroundProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('demo');
  const { styles } = useStyles();

  return (
    <Flexbox flex={1} gap={16}>
      {/* Main Tabs */}
      <Flexbox horizontal padding={4}>
        <TouchableOpacity
          onPress={() => setActiveTab('demo')}
          style={[styles.tab, activeTab === 'demo' && styles.tabActive]}
        >
          <Code2
            color={activeTab === 'demo' ? styles.tabTextActive.color : styles.tabTextInactive.color}
            size={20}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'demo' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            演示
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('readme')}
          style={[styles.tab, activeTab === 'readme' && styles.tabActive]}
        >
          <BookOpen
            color={
              activeTab === 'readme' ? styles.tabTextActive.color : styles.tabTextInactive.color
            }
            size={20}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'readme' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            文档
          </Text>
        </TouchableOpacity>
      </Flexbox>

      {/* Content */}
      <Flexbox flex={1}>
        {activeTab === 'demo' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
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
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Flexbox paddingInline={16}>
              <Markdown>{readmeContent}</Markdown>
            </Flexbox>{' '}
          </ScrollView>
        )}
      </Flexbox>
    </Flexbox>
  );
};

export default ComponentPlayground;
