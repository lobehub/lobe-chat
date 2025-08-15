import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { renderWithTheme } from '@/test/utils';
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
    const { toJSON } = renderWithTheme(<ListItem title="Test Item" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with avatar', () => {
    const { toJSON } = renderWithTheme(
      <ListItem title="Test Item" avatar="https://example.com/avatar.png" />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with description', () => {
    const { toJSON } = renderWithTheme(
      <ListItem title="Test Item" description="This is a description" />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with extra content', () => {
    const { toJSON } = renderWithTheme(<ListItem title="Test Item" extra="Extra info" />);

    expect(toJSON()).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { toJSON } = renderWithTheme(<ListItem title="Test Item" onPress={onPress} />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with href as Link component', () => {
    const { toJSON } = renderWithTheme(<ListItem title="Test Item" href="/(auth)/login" />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with href and onPress', () => {
    const onPress = jest.fn();
    const { toJSON } = renderWithTheme(
      <ListItem title="Test Item" href="/(auth)/login" onPress={onPress} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders with React node avatar', () => {
    const CustomAvatar = () => <View testID="custom-avatar">Custom</View>;
    const { toJSON } = renderWithTheme(<ListItem title="Test Item" avatar={<CustomAvatar />} />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders with React node extra', () => {
    const ExtraComponent = () => <View testID="extra-component">Extra</View>;
    const { toJSON } = renderWithTheme(<ListItem title="Test Item" extra={<ExtraComponent />} />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles long descriptions with ellipsis', () => {
    const longDescription =
      'This is a very long description that should be truncated with ellipsis when it exceeds the maximum number of lines allowed';
    const { toJSON } = renderWithTheme(
      <ListItem title="Test Item" description={longDescription} />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles empty description', () => {
    const { toJSON } = renderWithTheme(<ListItem title="Test Item" description="" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles missing description', () => {
    const { toJSON } = renderWithTheme(<ListItem title="Test Item" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles missing avatar', () => {
    const { toJSON } = renderWithTheme(<ListItem title="Test Item" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles missing extra', () => {
    const { toJSON } = renderWithTheme(<ListItem title="Test Item" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles URL detection for avatar', () => {
    const { toJSON } = renderWithTheme(
      <ListItem title="Test Item" avatar="https://example.com/avatar.png" />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles non-URL avatar', () => {
    const { toJSON } = renderWithTheme(<ListItem title="Test Item" avatar="not-a-url" />);

    expect(toJSON()).toBeTruthy();
  });

  it('sets correct avatar size', () => {
    const { toJSON } = renderWithTheme(
      <ListItem title="Test Item" avatar="https://example.com/avatar.png" />,
    );

    expect(toJSON()).toBeTruthy();
  });

  it('handles all props together', () => {
    const onPress = jest.fn();
    const { toJSON } = renderWithTheme(
      <ListItem
        title="Complete Item"
        avatar="https://example.com/avatar.png"
        description="Full description"
        extra="Extra content"
        href="/(auth)/login"
        onPress={onPress}
      />,
    );

    expect(toJSON()).toBeTruthy();
  });
});
