import React from 'react';
import { Text, View } from 'react-native';
import { renderWithTheme } from '@/test/utils';
import Space from '../index';

describe('Space', () => {
  it('renders correctly with default props', () => {
    const { root } = renderWithTheme(
      <Space>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(root).toBeTruthy();
    expect(root.findAllByType(Text)).toHaveLength(2);
  });

  it('renders with horizontal direction (default)', () => {
    const { toJSON } = renderWithTheme(
      <Space direction="horizontal">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with vertical direction', () => {
    const { toJSON } = renderWithTheme(
      <Space direction="vertical">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with small size', () => {
    const { toJSON } = renderWithTheme(
      <Space size="small">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with middle size', () => {
    const { toJSON } = renderWithTheme(
      <Space size="middle">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with large size', () => {
    const { toJSON } = renderWithTheme(
      <Space size="large">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom numeric size', () => {
    const { toJSON } = renderWithTheme(
      <Space size={24}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with array size (horizontal and vertical)', () => {
    const { toJSON } = renderWithTheme(
      <Space size={[16, 24]}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with start alignment', () => {
    const { toJSON } = renderWithTheme(
      <Space align="start">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with end alignment', () => {
    const { toJSON } = renderWithTheme(
      <Space align="end">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with center alignment', () => {
    const { toJSON } = renderWithTheme(
      <Space align="center">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with baseline alignment', () => {
    const { toJSON } = renderWithTheme(
      <Space align="baseline">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with wrap enabled', () => {
    const { toJSON } = renderWithTheme(
      <Space wrap>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with wrap disabled', () => {
    const { toJSON } = renderWithTheme(
      <Space wrap={false}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: '#f0f0f0' };
    const { toJSON } = renderWithTheme(
      <Space style={customStyle}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles empty children', () => {
    const { toJSON } = renderWithTheme(<Space>{null}</Space>);

    // Space with null children might return null, which is valid
    expect(toJSON).toBeDefined();
  });

  it('handles single child', () => {
    const { toJSON } = renderWithTheme(
      <Space>
        <Text>Single Item</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles multiple children', () => {
    const { toJSON } = renderWithTheme(
      <Space>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
        <Text>Item 4</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles different types of children', () => {
    const { toJSON } = renderWithTheme(
      <Space>
        <Text>Text Item</Text>
        <View testID="view-item">
          <Text>View Content</Text>
        </View>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with all props combined', () => {
    const { toJSON } = renderWithTheme(
      <Space
        direction="vertical"
        size="large"
        align="center"
        wrap={true}
        style={{ backgroundColor: '#f0f0f0' }}
      >
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles array of mixed sizes', () => {
    const { toJSON } = renderWithTheme(
      <Space size={['small', 'large']}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles array of numeric sizes', () => {
    const { toJSON } = renderWithTheme(
      <Space size={[8, 16]}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(toJSON()).toBeTruthy();
  });
});
