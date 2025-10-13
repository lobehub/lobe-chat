import * as React from 'react';
import { Text, View } from 'react-native';

import { renderWithTheme } from '@/test/utils';

import Card from '../index';

jest.mock('../style', () => ({
  useStyles: () => ({
    styles: {
      container: {},
      content: {},
      cover: {},
      divider: {},
      extra: {},
      header: {},
      titleContainer: {},
      titleRow: {},
      title: {},
    },
  }),
}));

jest.mock('@/components/Block', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
  };
});

describe('Card', () => {
  it('renders title, extra and content', () => {
    const { toJSON } = renderWithTheme(
      <Card extra={<Text>操作</Text>} title="卡片标题">
        <Text>正文内容</Text>
      </Card>,
    );

    const output = JSON.stringify(toJSON());

    expect(output).toContain('卡片标题');
    expect(output).toContain('操作');
    expect(output).toContain('card-content');
  });

  it('hides all dividers when divider is false', () => {
    const { toJSON } = renderWithTheme(
      <Card divider={false} title="分隔线控制">
        <Text>内容</Text>
      </Card>,
    );

    const dividerMatches = JSON.stringify(toJSON()).match(/card-divider/g);

    expect(dividerMatches ?? []).toHaveLength(0);
  });

  it('renders divider between header and content by default', () => {
    const { toJSON } = renderWithTheme(
      <Card extra={<Text>操作</Text>} title="有分隔线">
        <Text>内容</Text>
      </Card>,
    );

    const dividerMatches = JSON.stringify(toJSON()).match(/card-divider/g);

    expect(dividerMatches ?? []).toHaveLength(1);
  });

  it('renders cover and extra slots', () => {
    const { toJSON } = renderWithTheme(
      <Card
        cover={
          <View>
            <Text>封面</Text>
          </View>
        }
        extra={<Text>操作区</Text>}
        title="封面卡片"
      >
        <Text>内容</Text>
      </Card>,
    );

    const output = JSON.stringify(toJSON());

    expect(output).toContain('card-cover');
    expect(output).toContain('操作区');
  });
});
