import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import { renderWithTheme } from '@/test/utils';
import Avatar from '..';

jest.mock('../../../const/meta', () => ({
  DEFAULT_AVATAR: 'https://example.com/default-avatar.png',
}));

jest.mock('../../../utils/common', () => ({
  isEmoji: jest.fn((str: string) => str === '😀' || str === '🚀'),
}));

jest.mock('../../FluentEmoji', () => {
  const MockFluentEmoji = ({
    emoji,
    size,
    type,
  }: {
    emoji: string;
    size: number;
    type: string;
  }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, {
      'testID': 'fluent-emoji',
      'data-emoji': emoji,
      'data-size': size,
      'data-type': type,
    });
  };
  return MockFluentEmoji;
});

describe('Avatar', () => {
  it('renders correctly with default props', () => {
    const { root } = renderWithTheme(<Avatar />);

    expect(root).toBeTruthy();
  });

  it('renders with URL avatar', () => {
    const avatarUrl = 'https://example.com/avatar.png';
    const { getByRole } = renderWithTheme(<Avatar avatar={avatarUrl} />);

    const image = getByRole('image');
    expect(image.props.source).toEqual({ uri: avatarUrl });
  });

  it('renders with emoji avatar', () => {
    const { getByTestId } = renderWithTheme(<Avatar avatar="😀" size={32} />);

    const fluentEmoji = getByTestId('fluent-emoji');
    expect(fluentEmoji.props['data-emoji']).toBe('😀');
    expect(fluentEmoji.props['data-size']).toBe(25.6); // 32 * 0.8
    expect(fluentEmoji.props['data-type']).toBe('3d');
  });

  it('renders with emoji avatar and animation', () => {
    const { getByTestId } = renderWithTheme(<Avatar avatar="🚀" animation={true} />);

    const fluentEmoji = getByTestId('fluent-emoji');
    expect(fluentEmoji.props['data-emoji']).toBe('🚀');
    expect(fluentEmoji.props['data-type']).toBe('anim');
  });

  it('renders with text fallback', () => {
    const { getByText } = renderWithTheme(<Avatar avatar="John Doe" />);

    expect(getByText('JO')).toBeTruthy();
  });

  it('renders with title when avatar is default', () => {
    const { getByText } = renderWithTheme(<Avatar title="Jane Smith" />);

    expect(getByText('JA')).toBeTruthy();
  });

  it('handles image load error', () => {
    const { getByRole } = renderWithTheme(<Avatar avatar="https://invalid.url/image.png" />);

    const image = getByRole('image');

    fireEvent(image, 'error');

    expect(image.props.source).toEqual({ uri: 'https://example.com/default-avatar.png' });
  });

  it('renders with React element avatar', () => {
    const CustomAvatar = () => <View testID="custom-avatar" />;
    const { getByTestId } = renderWithTheme(<Avatar avatar={<CustomAvatar />} />);

    expect(getByTestId('custom-avatar')).toBeTruthy();
  });

  it('uses alt text for accessibility', () => {
    const altText = 'User avatar';
    const { getByRole } = renderWithTheme(
      <Avatar avatar="https://example.com/avatar.png" alt={altText} />,
    );

    const image = getByRole('image');
    expect(image.props.accessibilityLabel).toBe(altText);
  });

  it('handles data URL avatar', () => {
    const dataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const { getByRole } = renderWithTheme(<Avatar avatar={dataUrl} />);

    const image = getByRole('image');
    expect(image.props.source).toEqual({ uri: dataUrl });
  });

  it('handles relative path avatar', () => {
    const relativePath = '/assets/avatar.png';
    const { getByRole } = renderWithTheme(<Avatar avatar={relativePath} />);

    const image = getByRole('image');
    expect(image.props.source).toEqual({ uri: relativePath });
  });

  it('handles empty text gracefully', () => {
    const { getByText } = renderWithTheme(<Avatar avatar="" />);

    expect(getByText('')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { root } = renderWithTheme(<Avatar size={64} />);

    expect(root).toBeTruthy();
  });

  it('renders with custom background color', () => {
    const { root } = renderWithTheme(<Avatar backgroundColor="#ff0000" />);

    expect(root).toBeTruthy();
  });
});
