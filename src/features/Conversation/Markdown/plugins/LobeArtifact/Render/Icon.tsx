import { SiReact } from '@icons-pack/react-simple-icons';
import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { CodeXml, GlobeIcon, ImageIcon, Loader2, OrigamiIcon } from 'lucide-react';
import { memo } from 'react';

interface ArtifactProps {
  type: string;
}

const SIZE = 28;
const ArtifactIcon = memo<ArtifactProps>(({ type }) => {
  const theme = useTheme();

  if (!type)
    return <Icon icon={Loader2} size={SIZE} spin style={{ color: theme.colorTextSecondary }} />;

  switch (type) {
    case 'application/lobe.artifacts.code': {
      return <Icon icon={CodeXml} size={SIZE} style={{ color: theme.colorTextSecondary }} />;
    }

    case 'application/lobe.artifacts.react': {
      return <SiReact size={SIZE} style={{ color: theme.colorTextSecondary }} />;
    }

    case 'image/svg+xml': {
      return <Icon icon={ImageIcon} size={SIZE} style={{ color: theme.colorTextSecondary }} />;
    }
    case 'text/html': {
      return <Icon icon={GlobeIcon} size={SIZE} style={{ color: theme.colorTextSecondary }} />;
    }
    default: {
      return (
        <Icon color={theme.purple} icon={OrigamiIcon} size={{ size: SIZE, strokeWidth: 1.2 }} />
      );
    }
  }
});

export default ArtifactIcon;
