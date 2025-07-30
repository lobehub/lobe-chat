import React from 'react';
import { Text, View } from 'react-native';
import { renderWithTheme } from '@/mobile/test/utils';
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
    const { getByText } = renderWithTheme(
      <Space direction="horizontal">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with vertical direction', () => {
    const { getByText } = renderWithTheme(
      <Space direction="vertical">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with small size', () => {
    const { getByText } = renderWithTheme(
      <Space size="small">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with middle size', () => {
    const { getByText } = renderWithTheme(
      <Space size="middle">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with large size', () => {
    const { getByText } = renderWithTheme(
      <Space size="large">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with custom numeric size', () => {
    const { getByText } = renderWithTheme(
      <Space size={24}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with array size (horizontal and vertical)', () => {
    const { getByText } = renderWithTheme(
      <Space size={[16, 24]}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with start alignment', () => {
    const { getByText } = renderWithTheme(
      <Space align="start">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with end alignment', () => {
    const { getByText } = renderWithTheme(
      <Space align="end">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with center alignment', () => {
    const { getByText } = renderWithTheme(
      <Space align="center">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with baseline alignment', () => {
    const { getByText } = renderWithTheme(
      <Space align="baseline">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with wrap enabled', () => {
    const { getByText } = renderWithTheme(
      <Space wrap>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
    expect(getByText('Item 3')).toBeTruthy();
  });

  it('renders with wrap disabled', () => {
    const { getByText } = renderWithTheme(
      <Space wrap={false}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: '#f0f0f0' };
    const { getByText } = renderWithTheme(
      <Space style={customStyle}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('handles empty children', () => {
    const { root } = renderWithTheme(<Space>{null}</Space>);

    expect(root).toBeTruthy();
  });

  it('handles single child', () => {
    const { getByText } = renderWithTheme(
      <Space>
        <Text>Single Item</Text>
      </Space>,
    );

    expect(getByText('Single Item')).toBeTruthy();
  });

  it('handles multiple children', () => {
    const { getByText } = renderWithTheme(
      <Space>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
        <Text>Item 4</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
    expect(getByText('Item 3')).toBeTruthy();
    expect(getByText('Item 4')).toBeTruthy();
  });

  it('handles different types of children', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <Space>
        <Text>Text Item</Text>
        <View testID="view-item">
          <Text>View Content</Text>
        </View>
      </Space>,
    );

    expect(getByText('Text Item')).toBeTruthy();
    expect(getByTestId('view-item')).toBeTruthy();
    expect(getByText('View Content')).toBeTruthy();
  });

  it('renders with all props combined', () => {
    const { getByText } = renderWithTheme(
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

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
    expect(getByText('Item 3')).toBeTruthy();
  });

  it('handles array of mixed sizes', () => {
    const { getByText } = renderWithTheme(
      <Space size={['small', 'large']}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('handles array of numeric sizes', () => {
    const { getByText } = renderWithTheme(
      <Space size={[8, 16]}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Space>,
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });
});
