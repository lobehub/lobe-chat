import { Center, cssVar, Icon } from '@lobehub/ui';
import { CircleUser } from 'lucide-react';
import { memo } from 'react';

import Avatar from '@/components/Avatar';
import UserProfilePopup from '@/features/UserProfileCard/UserProfilePopup';

import { useUserDisplayMeta } from '../shared/useUserDisplayMeta';

interface AssigneeUserAvatarProps {
  size?: number;
  tooltip?: boolean;
  userId?: string | null;
}

/** Human-assignee twin of `AssigneeAvatar` (which renders agent assignees). */
const AssigneeUserAvatar = memo<AssigneeUserAvatarProps>(({ userId, size = 18, tooltip }) => {
  const displayMeta = useUserDisplayMeta(userId);

  if (!displayMeta) {
    return (
      <Center
        height={size}
        width={size}
        style={{
          borderRadius: '50%',
          color: cssVar.colorTextQuaternary,
          flexShrink: 0,
        }}
      >
        <Icon icon={CircleUser} size={size} />
      </Center>
    );
  }

  const avatar = (
    <Avatar
      avatar={displayMeta.avatar || undefined}
      name={displayMeta.title || undefined}
      shape={'circle'}
      size={size}
      title={displayMeta.title || undefined}
      variant={'outlined'}
    />
  );

  // With `tooltip` the avatar is the task row's reassign button, so its click
  // keeps opening the picker and the profile is a hover preview only. Pickers
  // render it without `tooltip`, where a popup would fight the dropdown.
  return tooltip ? (
    <UserProfilePopup fallbackTitle={displayMeta.title} trigger={'hover'} userId={userId}>
      {avatar}
    </UserProfilePopup>
  ) : (
    avatar
  );
});

export default AssigneeUserAvatar;
