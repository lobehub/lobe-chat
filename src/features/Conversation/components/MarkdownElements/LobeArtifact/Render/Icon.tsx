import { SiReact } from '@icons-pack/react-simple-icons';
import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { CodeXml, GlobeIcon, ImageIcon, Loader2, OrigamiIcon } from 'lucide-react';
import { memo } from 'react';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    cursor: pointer;

    margin-block-start: 12px;
    border: 1px solid ${token.colorBorder};
    border-radius: 8px;

    color: ${token.colorText};

    &:hover {
      background: ${isDarkMode ? '' : token.colorFillSecondary};
    }
  `,

  desc: css`
    color: ${token.colorTextTertiary};
  `,
  title: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    font-size: 16px;
    text-overflow: ellipsis;
  `,
}));

interface ArtifactProps {
  type: string;
}

const SIZE = 28;
const ArtifactIcon = memo<ArtifactProps>(({ type }) => {
  const { theme } = useStyles();

  if (!type)
    return (
      <Icon
        icon={Loader2}
        size={{ fontSize: SIZE }}
        spin
        style={{ color: theme.colorTextSecondary }}
      />
    );

  switch (type) {
    case 'application/lobe.artifacts.code': {
      return (
        <Icon
          icon={CodeXml}
          size={{ fontSize: SIZE }}
          style={{ color: theme.colorTextSecondary }}
        />
      );
    }

    case 'application/lobe.artifacts.react': {
      return <SiReact size={SIZE} style={{ color: theme.colorTextSecondary }} />;
    }

    case 'image/svg+xml': {
      return (
        <Icon
          icon={ImageIcon}
          size={{ fontSize: SIZE }}
          style={{ color: theme.colorTextSecondary }}
        />
      );
    }
    case 'text/html': {
      return (
        <Icon
          icon={GlobeIcon}
          size={{ fontSize: SIZE }}
          style={{ color: theme.colorTextSecondary }}
        />
      );
    }
    default: {
      return (
        <Icon color={theme.purple} icon={OrigamiIcon} size={{ fontSize: SIZE, strokeWidth: 1.2 }} />
      );
    }
  }
});

export default ArtifactIcon;
