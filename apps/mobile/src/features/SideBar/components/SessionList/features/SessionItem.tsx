import { LobeAgentSession } from '@lobechat/types';
import { Cell, Flexbox, Icon, Text, useTheme } from '@lobehub/ui-rn';
import Avatar from '@lobehub/ui-rn/Avatar';
import { PinIcon } from 'lucide-react-native';
import { memo, useCallback, useMemo } from 'react';

import { AVATAR_SIZE_MEDIUM } from '@/_const/common';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { formatShortTime } from '@/utils/formatTime';

const SessionItem = memo<LobeAgentSession>(({ id, pinned, meta, updatedAt, createdAt }) => {
  const activeId = useSessionStore((s) => s.activeId);
  const switchSession = useSwitchSession();
  const theme = useTheme();

  const isActive = activeId === id;

  const { title, description, avatar, backgroundColor } = useMemo(() => {
    return {
      avatar: sessionMetaSelectors.getAvatar(meta),
      backgroundColor: meta.backgroundColor,
      description: sessionMetaSelectors.getDescription(meta),
      title: sessionMetaSelectors.getTitle(meta),
    };
  }, [meta]);

  const handlePress = useCallback(() => {
    // 使用 useSwitchSession hook，它会自动处理路由导航和抽屉关闭
    switchSession(id);
  }, [id, switchSession]);

  return (
    <Cell
      active={isActive}
      description={
        (description || pinned) && (
          <Flexbox align={'center'} flex={1} gap={8} horizontal justify={'space-between'}>
            <Text ellipsis fontSize={12} style={{ flex: 1 }} type={'secondary'}>
              {description}
            </Text>
            {pinned && <Icon color={theme.colorTextDescription} icon={PinIcon} size={12} />}
          </Flexbox>
        )
      }
      icon={<Avatar avatar={avatar} backgroundColor={backgroundColor} size={AVATAR_SIZE_MEDIUM} />}
      iconSize={AVATAR_SIZE_MEDIUM}
      onPress={handlePress}
      paddingBlock={10}
      showArrow={false}
      style={{
        paddingRight: 8,
      }}
      title={
        <Flexbox align={'center'} flex={1} gap={8} horizontal justify={'space-between'}>
          <Text ellipsis fontSize={16} style={{ flex: 1 }} weight={500}>
            {title}
          </Text>
          <Text align={'right'} fontSize={12} type={'secondary'}>
            {formatShortTime(Number(updatedAt || createdAt))}
          </Text>
        </Flexbox>
      }
    />
  );
});

SessionItem.displayName = 'SessionItem';

export default SessionItem;
