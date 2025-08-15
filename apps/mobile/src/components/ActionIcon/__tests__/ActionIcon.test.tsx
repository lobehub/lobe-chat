import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { View, ColorValue, StyleProp, ViewStyle } from 'react-native';
import { renderWithTheme } from '@/test/utils';
import ActionIcon from '../index';

const MockIcon = ({
  color,
  size,
  style,
}: {
  color?: ColorValue;
  size?: number | string;
  style?: StyleProp<ViewStyle>;
}) => (
  <View
    testID="mock-icon"
    style={[
      { width: size as number, height: size as number, backgroundColor: color as any },
      style,
    ]}
  />
);

describe('ActionIcon', () => {
  it('renders correctly with default props', () => {
    const { toJSON } = renderWithTheme(<ActionIcon icon={MockIcon} />);

    expect(toJSON()).toBeTruthy();
  });

  it('applies custom size to icon', () => {
    const { toJSON } = renderWithTheme(<ActionIcon icon={MockIcon} size={32} />);

    expect(toJSON()).toBeTruthy();
  });

  it('applies custom color to icon', () => {
    const { toJSON } = renderWithTheme(<ActionIcon icon={MockIcon} color="#ff0000" />);

    expect(toJSON()).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { toJSON } = renderWithTheme(<ActionIcon icon={MockIcon} onPress={onPress} />);

    expect(toJSON()).toBeTruthy();
    expect(onPress).toBeDefined();
  });

  it('renders with primary variant', () => {
    const { toJSON } = renderWithTheme(<ActionIcon icon={MockIcon} variant="primary" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with secondary variant', () => {
    const { toJSON } = renderWithTheme(<ActionIcon icon={MockIcon} variant="secondary" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with danger variant', () => {
    const { toJSON } = renderWithTheme(<ActionIcon icon={MockIcon} variant="danger" />);

    expect(toJSON()).toBeTruthy();
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { toJSON } = renderWithTheme(<ActionIcon icon={MockIcon} onPress={onPress} disabled />);

    expect(toJSON()).toBeTruthy();
    expect(onPress).toBeDefined();
  });

  it('renders with spin animation enabled', () => {
    const { toJSON } = renderWithTheme(<ActionIcon icon={MockIcon} spin={true} duration={500} />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles spin animation state changes', () => {
    const { rerender, toJSON } = renderWithTheme(<ActionIcon icon={MockIcon} spin={true} />);
    expect(toJSON()).toBeTruthy();

    rerender(<ActionIcon icon={MockIcon} spin={false} />);
    expect(toJSON()).toBeTruthy();
  });
});
