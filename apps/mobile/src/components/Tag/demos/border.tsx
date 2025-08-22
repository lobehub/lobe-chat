import React from 'react';
import { ScrollView, View } from 'react-native';
import { Tag } from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
    padding: token.padding,
  },
  section: {
    marginBottom: token.marginLG,
  },
  tagGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginSM,
  },
  title: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: '600',
    marginBottom: token.marginMD,
  },
}));

const BorderDemo = () => {
  const { styles } = useStyles();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.tagGroup}>
          <Tag border={false}>Tag 1</Tag>
          <Tag border={false}>Tag 2</Tag>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.tagGroup}>
          <Tag border={false} color="success">
            Success
          </Tag>
          <Tag border={false} color="processing">
            Processing
          </Tag>
          <Tag border={false} color="error">
            Error
          </Tag>
          <Tag border={false} color="warning">
            Warning
          </Tag>
          <Tag border={false} color="red">
            Red
          </Tag>
          <Tag border={false} color="volcano">
            Volcano
          </Tag>
          <Tag border={false} color="orange">
            Orange
          </Tag>
          <Tag border={false} color="gold">
            Gold
          </Tag>
          <Tag border={false} color="yellow">
            Yellow
          </Tag>
          <Tag border={false} color="lime">
            Lime
          </Tag>
          <Tag border={false} color="green">
            Green
          </Tag>
          <Tag border={false} color="cyan">
            Cyan
          </Tag>
          <Tag border={false} color="blue">
            Blue
          </Tag>
          <Tag border={false} color="geekblue">
            Geekblue
          </Tag>
          <Tag border={false} color="purple">
            Purple
          </Tag>
          <Tag border={false} color="magenta">
            Magenta
          </Tag>
          <Tag border={false} color="gray">
            Gray
          </Tag>
        </View>
      </View>
    </ScrollView>
  );
};

export default BorderDemo;
