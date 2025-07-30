import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { renderWithTheme } from '@/mobile/test/utils';
import ListItem from '../index';

jest.mock('expo-router', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { 'testID': 'link', 'data-href': href }, children);
  },
  Href: 'string',
}));

jest.mock('../..', () => ({
  Avatar: ({ avatar, size }: { avatar: string | React.ReactNode; size: number }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(
      View,
      { 'testID': 'avatar', 'data-avatar': avatar, 'data-size': size },
      'Avatar',
    );
  },
}));

describe('ListItem', () => {
  it('renders correctly with basic props', () => {
    const { getByText } = renderWithTheme(<ListItem title="Test Item" />);

    expect(getByText('Test Item')).toBeTruthy();
  });

  it('renders with avatar', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <ListItem title="Test Item" avatar="https://example.com/avatar.png" />,
    );

    expect(getByText('Test Item')).toBeTruthy();
    expect(getByTestId('avatar')).toBeTruthy();
  });

  it('renders with description', () => {
    const { getByText } = renderWithTheme(
      <ListItem title="Test Item" description="This is a description" />,
    );

    expect(getByText('Test Item')).toBeTruthy();
    expect(getByText('This is a description')).toBeTruthy();
  });

  it('renders with extra content', () => {
    const { getByText } = renderWithTheme(<ListItem title="Test Item" extra="Extra info" />);

    expect(getByText('Test Item')).toBeTruthy();
    expect(getByText('Extra info')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(<ListItem title="Test Item" onPress={onPress} />);

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders with href as Link component', () => {
    const { getByTestId } = renderWithTheme(<ListItem title="Test Item" href="/test-route" />);

    const link = getByTestId('link');
    expect(link).toBeTruthy();
    expect(link.props['data-href']).toBe('/test-route');
  });

  it('renders with href and onPress', () => {
    const onPress = jest.fn();
    const { getByTestId, getByRole } = renderWithTheme(
      <ListItem title="Test Item" href="/test-route" onPress={onPress} />,
    );

    const link = getByTestId('link');
    expect(link).toBeTruthy();

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders with React node avatar', () => {
    const CustomAvatar = () => <View testID="custom-avatar">Custom</View>;
    const { getByTestId } = renderWithTheme(
      <ListItem title="Test Item" avatar={<CustomAvatar />} />,
    );

    expect(getByTestId('avatar')).toBeTruthy();
  });

  it('renders with React node extra', () => {
    const ExtraComponent = () => <View testID="extra-component">Extra</View>;
    const { getByTestId } = renderWithTheme(
      <ListItem title="Test Item" extra={<ExtraComponent />} />,
    );

    expect(getByTestId('extra-component')).toBeTruthy();
  });

  it('handles long descriptions with ellipsis', () => {
    const longDescription =
      'This is a very long description that should be truncated with ellipsis when it exceeds the maximum number of lines allowed';
    const { getByText } = renderWithTheme(
      <ListItem title="Test Item" description={longDescription} />,
    );

    expect(getByText(longDescription)).toBeTruthy();
  });

  it('handles empty description', () => {
    const { getByText, queryByText } = renderWithTheme(
      <ListItem title="Test Item" description="" />,
    );

    expect(getByText('Test Item')).toBeTruthy();
    expect(queryByText('')).toBeNull();
  });

  it('handles missing description', () => {
    const { getByText } = renderWithTheme(<ListItem title="Test Item" />);

    expect(getByText('Test Item')).toBeTruthy();
  });

  it('handles missing avatar', () => {
    const { getByText, queryByTestId } = renderWithTheme(<ListItem title="Test Item" />);

    expect(getByText('Test Item')).toBeTruthy();
    expect(queryByTestId('avatar')).toBeNull();
  });

  it('handles missing extra', () => {
    const { getByText } = renderWithTheme(<ListItem title="Test Item" />);

    expect(getByText('Test Item')).toBeTruthy();
  });

  it('handles URL detection for avatar', () => {
    const { getByTestId } = renderWithTheme(
      <ListItem title="Test Item" avatar="https://example.com/avatar.png" />,
    );

    const avatar = getByTestId('avatar');
    expect(avatar.props['data-avatar']).toBe('https://example.com/avatar.png');
  });

  it('handles non-URL avatar', () => {
    const { getByTestId } = renderWithTheme(<ListItem title="Test Item" avatar="not-a-url" />);

    const avatar = getByTestId('avatar');
    expect(avatar.props['data-avatar']).toBe('not-a-url');
  });

  it('sets correct avatar size', () => {
    const { getByTestId } = renderWithTheme(
      <ListItem title="Test Item" avatar="https://example.com/avatar.png" />,
    );

    const avatar = getByTestId('avatar');
    expect(avatar.props['data-size']).toBe(48);
  });

  it('handles all props together', () => {
    const onPress = jest.fn();
    const { getByText, getByTestId } = renderWithTheme(
      <ListItem
        title="Complete Item"
        avatar="https://example.com/avatar.png"
        description="Full description"
        extra="Extra content"
        href="/test-route"
        onPress={onPress}
      />,
    );

    expect(getByText('Complete Item')).toBeTruthy();
    expect(getByText('Full description')).toBeTruthy();
    expect(getByText('Extra content')).toBeTruthy();
    expect(getByTestId('avatar')).toBeTruthy();
    expect(getByTestId('link')).toBeTruthy();
  });
});
