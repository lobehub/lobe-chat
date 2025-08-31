import { BookOpen, Code2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Markdown } from '@/components';
import { useStyles } from './style';

type TabType = 'demo' | 'readme';

export interface DemoItem {
  component: React.ReactNode;
  key: string;
  title: string;
}

export interface ComponentPlaygroundProps {
  demos: DemoItem[];
  readmeContent: string;
  subtitle: string;
  title: string;
}

const ComponentPlayground = ({
  title,
  subtitle,
  demos,
  readmeContent,
}: ComponentPlaygroundProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('demo');
  const { styles } = useStyles();

  return (
    <View style={[styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Main Tabs */}
      <View style={styles.tabContainer}>
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
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'demo' ? (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.demoScrollView}>
            {demos.map((demo, index) => (
              <View key={demo.key} style={styles.demoSection}>
                <Text style={styles.demoTitle}>{demo.title}</Text>
                <View style={styles.demoContent}>{demo.component}</View>
                {index < demos.length - 1 && <View style={styles.demoDivider} />}
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.readmeContainer}>
              <Markdown>{readmeContent}</Markdown>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default ComponentPlayground;
