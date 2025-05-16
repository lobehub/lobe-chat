import { Icon, Tag } from '@lobehub/ui';
import { BadgeCheck, CircleUser, Package } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { InstallPluginMeta } from '@/types/tool/plugin';

interface PluginTagProps extends Pick<InstallPluginMeta, 'author' | 'type'> {
  showIcon?: boolean;
  showText?: boolean;
}

const PluginTag = memo<PluginTagProps>(({ showIcon = true, author, type, showText = true }) => {
  const { t } = useTranslation('plugin');
  const isCustom = type === 'customPlugin';
  const isOfficial = author === 'LobeHub';

  return (
    <Tag
      color={isCustom ? 'warning' : isOfficial ? 'success' : undefined}
      icon={showIcon && <Icon icon={isCustom ? Package : isOfficial ? BadgeCheck : CircleUser} />}
      size={'small'}
    >
      {showText && (author || t(isCustom ? 'store.customPlugin' : 'store.communityPlugin'))}
    </Tag>
  );
});

export default PluginTag;
