import { Cell, Icon, useTheme } from '@lobehub/ui-rn';
import { ChevronDown } from 'lucide-react-native';
import { memo } from 'react';

interface SessionGroupHeaderProps {
  count: number;
  isExpanded: boolean;
  onPress: () => void;
  title: string;
}

/**
 * SessionGroupHeader - Session 分组头部组件
 * 显示分组名称、数量，支持折叠/展开
 */
const SessionGroupHeader = memo<SessionGroupHeaderProps>(({ title, isExpanded, onPress }) => {
  const theme = useTheme();

  return (
    <Cell
      extra={
        <Icon
          color={theme.colorTextDescription}
          icon={ChevronDown}
          size={16}
          style={[
            {
              transform: [{ rotate: isExpanded ? '0deg' : '-90deg' }],
            },
          ]}
        />
      }
      onPress={onPress}
      paddingBlock={4}
      paddingInline={16}
      pressEffect
      showArrow={false}
      style={{ minHeight: 40 }}
      title={title}
      titleProps={{
        fontSize: 13,
        type: 'secondary',
      }}
    />
  );
});

SessionGroupHeader.displayName = 'SessionGroupHeader';

export default SessionGroupHeader;
