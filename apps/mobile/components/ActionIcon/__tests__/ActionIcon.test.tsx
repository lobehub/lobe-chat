import React from 'react';
import { fireEvent, act } from '@testing-library/react-native';
import { View } from 'react-native';
import { renderWithTheme, rerenderWithTheme } from '@/mobile/test/utils';
import ActionIcon from '../index';

const MockIcon = ({ color, size }: { color?: string; size?: number }) => (
  <View testID="mock-icon" style={{ width: size, height: size, backgroundColor: color }} />
);

describe('ActionIcon', () => {
  it('renders correctly with default props', () => {
    const { getByTestId, getByRole } = renderWithTheme(<ActionIcon icon={MockIcon} />);

    expect(getByRole('button')).toBeTruthy();
    expect(getByTestId('mock-icon')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { getByTestId } = renderWithTheme(<ActionIcon icon={MockIcon} size={32} />);

    const icon = getByTestId('mock-icon');
    expect(icon.props.style).toMatchObject({ width: 32, height: 32 });
  });

  it('renders with custom color', () => {
    const { getByTestId } = renderWithTheme(<ActionIcon icon={MockIcon} color="#ff0000" />);

    const icon = getByTestId('mock-icon');
    expect(icon.props.style).toMatchObject({ backgroundColor: '#ff0000' });
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(<ActionIcon icon={MockIcon} onPress={onPress} />);

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders with primary variant', () => {
    const { getByRole } = renderWithTheme(<ActionIcon icon={MockIcon} variant="primary" />);

    expect(getByRole('button')).toBeTruthy();
  });

  it('renders with secondary variant', () => {
    const { getByRole } = renderWithTheme(<ActionIcon icon={MockIcon} variant="secondary" />);

    expect(getByRole('button')).toBeTruthy();
  });

  it('renders with danger variant', () => {
    const { getByRole } = renderWithTheme(<ActionIcon icon={MockIcon} variant="danger" />);

    expect(getByRole('button')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(
      <ActionIcon icon={MockIcon} onPress={onPress} disabled />,
    );

    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('handles spin animation', async () => {
    const { getByRole } = renderWithTheme(
      <ActionIcon icon={MockIcon} spin={true} duration={500} />,
    );

    expect(getByRole('button')).toBeTruthy();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  it('stops spin animation when spin prop changes to false', async () => {
    const { getByRole, rerender } = renderWithTheme(<ActionIcon icon={MockIcon} spin={true} />);

    expect(getByRole('button')).toBeTruthy();

    rerenderWithTheme(<ActionIcon icon={MockIcon} spin={false} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });
});
