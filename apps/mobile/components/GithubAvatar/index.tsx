import { memo } from 'react';
import urlJoin from 'url-join';

import Avatar, { type AvatarProps } from '@/mobile/components/Avatar';

interface GitHubAvatarProps extends Omit<AvatarProps, 'avatar'> {
  username: string;
}

const GitHubAvatar = memo<GitHubAvatarProps>(({ username, size = 24 }) => {
  const baseUrl = urlJoin('https://github.com', `${username}.png`);
  const url = `${baseUrl}?size=${size * 2}`;

  return <Avatar alt={username} avatar={url} size={size} />;
});

export default GitHubAvatar;
