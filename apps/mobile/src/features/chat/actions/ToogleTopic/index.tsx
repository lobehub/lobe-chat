import { ActionIcon, useTheme } from '@lobehub/ui-rn';
import { MessagesSquare } from 'lucide-react-native';

import { ICON_SIZE_LARGE } from '@/_const/common';
import { useGlobalStore } from '@/store/global';

const ToogleTopicBtn = () => {
  const toggleTopicDrawer = useGlobalStore((s) => s.toggleTopicDrawer);
  const token = useTheme();

  return (
    <ActionIcon
      color={token.colorTextSecondary}
      icon={MessagesSquare}
      onPress={toggleTopicDrawer}
      size={{
        blockSize: ICON_SIZE_LARGE + 4,
        borderRadius: ICON_SIZE_LARGE + 4,
        size: 18,
      }}
      variant={'outlined'}
    />
  );
};

export default ToogleTopicBtn;
