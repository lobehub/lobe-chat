import { memo } from 'react';
import urlJoin from 'url-join';

import Avatar from '../Avatar';
import type { GitHubAvatarProps } from './type';

const GitHubAvatar = memo<GitHubAvatarProps>(({ username, size = 24 }) => {
  const baseUrl = urlJoin('https://github.com', `${username}.png`);
  const url = `${baseUrl}?size=${size * 2}`;

  return <Avatar alt={username} avatar={url} size={size} />;
});

GitHubAvatar.displayName = 'GitHubAvatar';

export default GitHubAvatar;
