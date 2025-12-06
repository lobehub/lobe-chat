import { Button, ButtonProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { AppWindowIcon, BotIcon, ImageIcon, MicroscopeIcon, PenLineIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    height: 40px;
    background: ${token.colorBgContainerSecondary};

    &:hover {
      border-color: ${token.colorBorder} !important;
      background: ${token.colorFillTertiary} !important;
    }
  `,
}));

interface StarterItem {
  icon?: ButtonProps['icon'];
  key: string;
  onClick?: () => void;
  title: string;
}

const StarterList = memo(() => {
  const { styles, theme } = useStyles();

  const items: StarterItem[] = useMemo(
    () => [
      {
        icon: BotIcon,
        key: 'agent',
        title: '创建助理',
      },
      {
        icon: PenLineIcon,
        key: 'write',
        title: '写作',
      },
      {
        icon: ImageIcon,
        key: 'image',
        title: '绘画',
      },
      {
        icon: MicroscopeIcon,
        key: 'research',
        title: '探究',
      },
      {
        icon: AppWindowIcon,
        key: 'web',
        title: '编程',
      },
    ],
    [],
  );

  return (
    <Center gap={8} horizontal>
      {items.map((item) => (
        <Button
          className={styles.button}
          icon={item.icon}
          iconProps={{
            color: theme.colorTextSecondary,
            size: 18,
          }}
          key={item.key}
          onClick={item.onClick}
          shape={'round'}
        >
          {item.title}
        </Button>
      ))}
    </Center>
  );
});

export default StarterList;
