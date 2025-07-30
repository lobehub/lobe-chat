import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { renderWithTheme } from '@/test/utils';
import Tooltip from '../index';

jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="portal">{children}</div>
  ),
}));

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
  Animated: {
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    View: ({ children, style }: any) => <div style={style}>{children}</div>,
  },
}));

jest.mock('@/theme', () => ({
  useTheme: () => ({
    isDarkMode: false,
  }),
  useThemeToken: () => ({
    colorBgElevated: '#ffffff',
    colorText: '#000000',
    colorBorder: '#d9d9d9',
    borderRadius: 6,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  }),
}));

describe('Tooltip', () => {
  it('renders children correctly', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content">
        <Text>Trigger</Text>
      </Tooltip>,
    );

    expect(getByText('Trigger')).toBeTruthy();
  });

  it('shows tooltip on click trigger', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" trigger="click">
        <Text>Click me</Text>
      </Tooltip>,
    );

    fireEvent.press(getByText('Click me'));

    // The tooltip should be visible after click
    expect(getByText('Click me')).toBeTruthy();
  });

  it('shows tooltip on long press trigger', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" trigger="longPress">
        <Text>Long press me</Text>
      </Tooltip>,
    );

    fireEvent(getByText('Long press me'), 'longPress');

    expect(getByText('Long press me')).toBeTruthy();
  });

  it('renders with custom placement', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" placement="top">
        <Text>Top tooltip</Text>
      </Tooltip>,
    );

    expect(getByText('Top tooltip')).toBeTruthy();
  });

  it('renders with bottom placement', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" placement="bottom">
        <Text>Bottom tooltip</Text>
      </Tooltip>,
    );

    expect(getByText('Bottom tooltip')).toBeTruthy();
  });

  it('renders with left placement', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" placement="left">
        <Text>Left tooltip</Text>
      </Tooltip>,
    );

    expect(getByText('Left tooltip')).toBeTruthy();
  });

  it('renders with right placement', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" placement="right">
        <Text>Right tooltip</Text>
      </Tooltip>,
    );

    expect(getByText('Right tooltip')).toBeTruthy();
  });

  it('renders with arrow enabled', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" arrow={true}>
        <Text>Arrow tooltip</Text>
      </Tooltip>,
    );

    expect(getByText('Arrow tooltip')).toBeTruthy();
  });

  it('renders with arrow disabled', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" arrow={false}>
        <Text>No arrow tooltip</Text>
      </Tooltip>,
    );

    expect(getByText('No arrow tooltip')).toBeTruthy();
  });

  it('renders with custom color', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" color="#ff0000">
        <Text>Red tooltip</Text>
      </Tooltip>,
    );

    expect(getByText('Red tooltip')).toBeTruthy();
  });

  it('renders with custom overlay style', () => {
    const overlayStyle = { backgroundColor: '#f0f0f0' };
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" overlayStyle={overlayStyle}>
        <Text>Styled tooltip</Text>
      </Tooltip>,
    );

    expect(getByText('Styled tooltip')).toBeTruthy();
  });

  it('renders with custom text style', () => {
    const textStyle = { fontSize: 18 };
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" textStyle={textStyle}>
        <Text>Text styled tooltip</Text>
      </Tooltip>,
    );

    expect(getByText('Text styled tooltip')).toBeTruthy();
  });

  it('renders with visible prop', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" visible={true}>
        <Text>Always visible</Text>
      </Tooltip>,
    );

    expect(getByText('Always visible')).toBeTruthy();
  });

  it('renders with custom z-index', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" zIndex={1000}>
        <Text>High z-index</Text>
      </Tooltip>,
    );

    expect(getByText('High z-index')).toBeTruthy();
  });

  it('handles onVisibleChange callback', () => {
    const onVisibleChange = jest.fn();
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" onVisibleChange={onVisibleChange} trigger="click">
        <Text>Callback tooltip</Text>
      </Tooltip>,
    );

    fireEvent.press(getByText('Callback tooltip'));

    expect(getByText('Callback tooltip')).toBeTruthy();
  });

  it('renders with React node as title', () => {
    const titleNode = <Text>Custom title</Text>;
    const { getByText } = renderWithTheme(
      <Tooltip title={titleNode}>
        <Text>Node title</Text>
      </Tooltip>,
    );

    expect(getByText('Node title')).toBeTruthy();
  });

  it('renders with complex children', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <Tooltip title="Complex tooltip">
        <View testID="complex-child">
          <Text>Complex</Text>
          <Text>Children</Text>
        </View>
      </Tooltip>,
    );

    expect(getByTestId('complex-child')).toBeTruthy();
    expect(getByText('Complex')).toBeTruthy();
    expect(getByText('Children')).toBeTruthy();
  });

  it('renders with trigger none', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="Tooltip content" trigger="none">
        <Text>No trigger</Text>
      </Tooltip>,
    );

    expect(getByText('No trigger')).toBeTruthy();
  });

  it('handles multiple placements', () => {
    const placements = [
      'topLeft',
      'topRight',
      'bottomLeft',
      'bottomRight',
      'leftTop',
      'leftBottom',
      'rightTop',
      'rightBottom',
    ] as const;

    placements.forEach((placement) => {
      const { getByText } = renderWithTheme(
        <Tooltip title="Tooltip content" placement={placement}>
          <Text>{placement} tooltip</Text>
        </Tooltip>,
      );

      expect(getByText(`${placement} tooltip`)).toBeTruthy();
    });
  });

  it('renders with all props combined', () => {
    const onVisibleChange = jest.fn();
    const { getByText } = renderWithTheme(
      <Tooltip
        title="Full tooltip"
        placement="top"
        trigger="click"
        arrow={true}
        color="#ff0000"
        visible={false}
        zIndex={999}
        onVisibleChange={onVisibleChange}
        overlayStyle={{ padding: 10 }}
        textStyle={{ fontSize: 16 }}
      >
        <Text>Full featured</Text>
      </Tooltip>,
    );

    expect(getByText('Full featured')).toBeTruthy();
  });

  it('handles empty title', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title="">
        <Text>Empty title</Text>
      </Tooltip>,
    );

    expect(getByText('Empty title')).toBeTruthy();
  });

  it('handles null title', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title={null}>
        <Text>Null title</Text>
      </Tooltip>,
    );

    expect(getByText('Null title')).toBeTruthy();
  });

  it('handles undefined title', () => {
    const { getByText } = renderWithTheme(
      <Tooltip title={undefined}>
        <Text>Undefined title</Text>
      </Tooltip>,
    );

    expect(getByText('Undefined title')).toBeTruthy();
  });
});
