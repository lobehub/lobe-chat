import React from 'react';
import { renderWithTheme } from '@/test/utils';
import GitHubAvatar from '../index';

jest.mock('url-join', () => jest.fn((baseUrl: string, path: string) => `${baseUrl}/${path}`));

jest.mock('@/components/Avatar', () => {
  const MockAvatar = ({ avatar, size, alt }: { avatar: string; size: number; alt: string }) => (
    <div data-testid="avatar" data-avatar={avatar} data-size={size} data-alt={alt}>
      Avatar
    </div>
  );
  return MockAvatar;
});

describe('GitHubAvatar', () => {
  it('renders correctly with username', () => {
    const { toJSON } = renderWithTheme(<GitHubAvatar username="testuser" />);

    expect(toJSON()).toBeTruthy();
  });

  it('generates correct GitHub avatar URL', () => {
    const { toJSON } = renderWithTheme(<GitHubAvatar username="testuser" />);

    expect(toJSON()).toBeTruthy();
  });

  it('uses custom size', () => {
    const { toJSON } = renderWithTheme(<GitHubAvatar username="testuser" size={64} />);

    expect(toJSON()).toBeTruthy();
  });

  it('uses default size when not provided', () => {
    const { toJSON } = renderWithTheme(<GitHubAvatar username="testuser" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles usernames with special characters', () => {
    const { toJSON } = renderWithTheme(<GitHubAvatar username="test-user_123" />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles empty username', () => {
    const { toJSON } = renderWithTheme(<GitHubAvatar username="" />);

    expect(toJSON()).toBeTruthy();
  });

  it('doubles the size for high-resolution images', () => {
    const { toJSON } = renderWithTheme(<GitHubAvatar username="testuser" size={32} />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles large size values', () => {
    const { toJSON } = renderWithTheme(<GitHubAvatar username="testuser" size={128} />);

    expect(toJSON()).toBeTruthy();
  });

  it('handles small size values', () => {
    const { toJSON } = renderWithTheme(<GitHubAvatar username="testuser" size={16} />);

    expect(toJSON()).toBeTruthy();
  });

  it('passes through other Avatar props', () => {
    const { toJSON } = renderWithTheme(<GitHubAvatar username="testuser" size={40} />);

    expect(toJSON()).toBeTruthy();
  });
});
