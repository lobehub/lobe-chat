import { GroupAvatar, Icon } from '@lobehub/ui';
import { GroupBotSquareIcon } from '@lobehub/ui/icons';
import { memo, useMemo } from 'react';

interface GroupAvatarProps {
  avatar: Array<{ avatar: string; background?: string }> | string | null;
}

const AgentGroupAvatar = memo<GroupAvatarProps>(({ avatar }) => {
  // Convert avatar to array format for GroupAvatar
  const avatars = Array.isArray(avatar) ? avatar : avatar ? [{ avatar }] : [];

  const displayAvatars = useMemo(
    () => avatars.map((item) => ({ ...item, style: { borderRadius: 3 } })),
    [avatars],
  );

  // Show default group icon if no member avatars
  if (avatars.length === 0) {
    return <Icon icon={GroupBotSquareIcon} size={28} />;
  }

  return (
    <GroupAvatar avatarShape={'square'} avatars={displayAvatars} cornerShape={'square'} size={22} />
  );
});

export default AgentGroupAvatar;
