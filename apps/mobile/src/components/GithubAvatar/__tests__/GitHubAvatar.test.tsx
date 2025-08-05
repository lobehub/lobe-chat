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
    const { getByTestId } = renderWithTheme(<GitHubAvatar username="testuser" />);

    const avatar = getByTestId('avatar');
    expect(avatar).toBeTruthy();
    expect(avatar.getAttribute('data-alt')).toBe('testuser');
  });

  it('generates correct GitHub avatar URL', () => {
    const { getByTestId } = renderWithTheme(<GitHubAvatar username="testuser" />);

    const avatar = getByTestId('avatar');
    expect(avatar.getAttribute('data-avatar')).toBe('https://github.com/testuser.png?size=48');
  });

  it('uses custom size', () => {
    const { getByTestId } = renderWithTheme(<GitHubAvatar username="testuser" size={64} />);

    const avatar = getByTestId('avatar');
    expect(avatar.getAttribute('data-size')).toBe('64');
    expect(avatar.getAttribute('data-avatar')).toBe('https://github.com/testuser.png?size=128');
  });

  it('uses default size when not provided', () => {
    const { getByTestId } = renderWithTheme(<GitHubAvatar username="testuser" />);

    const avatar = getByTestId('avatar');
    expect(avatar.getAttribute('data-size')).toBe('24');
    expect(avatar.getAttribute('data-avatar')).toBe('https://github.com/testuser.png?size=48');
  });

  it('handles usernames with special characters', () => {
    const { getByTestId } = renderWithTheme(<GitHubAvatar username="test-user_123" />);

    const avatar = getByTestId('avatar');
    expect(avatar.getAttribute('data-alt')).toBe('test-user_123');
    expect(avatar.getAttribute('data-avatar')).toBe('https://github.com/test-user_123.png?size=48');
  });

  it('handles empty username', () => {
    const { getByTestId } = renderWithTheme(<GitHubAvatar username="" />);

    const avatar = getByTestId('avatar');
    expect(avatar.getAttribute('data-alt')).toBe('');
    expect(avatar.getAttribute('data-avatar')).toBe('https://github.com/.png?size=48');
  });

  it('doubles the size for high-resolution images', () => {
    const { getByTestId } = renderWithTheme(<GitHubAvatar username="testuser" size={32} />);

    const avatar = getByTestId('avatar');
    expect(avatar.getAttribute('data-size')).toBe('32');
    expect(avatar.getAttribute('data-avatar')).toBe('https://github.com/testuser.png?size=64');
  });

  it('handles large size values', () => {
    const { getByTestId } = renderWithTheme(<GitHubAvatar username="testuser" size={128} />);

    const avatar = getByTestId('avatar');
    expect(avatar.getAttribute('data-size')).toBe('128');
    expect(avatar.getAttribute('data-avatar')).toBe('https://github.com/testuser.png?size=256');
  });

  it('handles small size values', () => {
    const { getByTestId } = renderWithTheme(<GitHubAvatar username="testuser" size={16} />);

    const avatar = getByTestId('avatar');
    expect(avatar.getAttribute('data-size')).toBe('16');
    expect(avatar.getAttribute('data-avatar')).toBe('https://github.com/testuser.png?size=32');
  });

  it('passes through other Avatar props', () => {
    const { getByTestId } = renderWithTheme(<GitHubAvatar username="testuser" size={40} />);

    const avatar = getByTestId('avatar');
    expect(avatar.getAttribute('data-size')).toBe('40');
    expect(avatar.getAttribute('data-alt')).toBe('testuser');
  });
});
