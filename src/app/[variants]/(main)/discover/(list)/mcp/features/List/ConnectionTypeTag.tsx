import { Icon, Tooltip } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Blend, Cloud, LaptopMinimalIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

interface ConnectionTypeTagProps {
  type?: 'hybrid' | 'local' | 'remote';
}

const ConnectionTypeTag = memo<ConnectionTypeTagProps>(({ type }) => {
  const { t } = useTranslation('discover');
  const theme = useTheme();

  const icons = {
    hybrid: {
      color: theme.purple,
      icon: Blend,
    },
    local: {
      color: theme.colorWarning,
      icon: LaptopMinimalIcon,
    },
    remote: {
      color: theme.colorInfo,
      icon: Cloud,
    },
  };

  if (!type || !icons[type]) return null;

  return (
    <Tooltip title={t(`mcp.details.connectionType.${type}.desc`)}>
      <Flexbox
        align={'center'}
        gap={6}
        horizontal
        style={{
          color: theme.colorTextSecondary,
          fontSize: 12,
        }}
      >
        <Icon color={icons[type].color} icon={icons[type].icon} size={14} />
        {t(`mcp.details.connectionType.${type}.title`)}
      </Flexbox>
    </Tooltip>
  );
});

export default ConnectionTypeTag;
