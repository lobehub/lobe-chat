import type { AvatarProps } from '../Avatar';

export interface GitHubAvatarProps extends Omit<AvatarProps, 'avatar'> {
  username: string;
}
