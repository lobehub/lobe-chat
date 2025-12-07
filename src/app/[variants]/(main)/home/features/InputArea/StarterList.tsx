import { Button, ButtonProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { BotIcon, ImageIcon, MicroscopeIcon, PenLineIcon } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { Center } from 'react-layout-kit';

import { type StarterMode, useHomeStore } from '@/store/home';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    border-color: ${token.colorPrimary};
    background: ${token.colorPrimaryBg};
  `,
  button: css`
    height: 40px;
    background: ${token.colorBgContainerSecondary};

    &:hover {
      border-color: ${token.colorBorder};
      background: ${token.colorFillTertiary};
    }
  `,
}));

interface StarterItem {
  icon?: ButtonProps['icon'];
  key: StarterMode;
  title: string;
}

const StarterList = memo(() => {
  const { styles, cx, theme } = useStyles();

  const [inputActiveMode, setInputActiveMode] = useHomeStore((s) => [
    s.inputActiveMode,
    s.setInputActiveMode,
  ]);

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
      // {
      //   icon: AppWindowIcon,
      //   key: 'web',
      //   title: '编程',
      // },
    ],
    [],
  );

  const handleClick = useCallback(
    (key: StarterMode) => {
      // Toggle mode: if clicking the active mode, clear it; otherwise set it
      if (inputActiveMode === key) {
        setInputActiveMode(null);
      } else {
        setInputActiveMode(key);
      }
    },
    [inputActiveMode, setInputActiveMode],
  );

  return (
    <Center gap={8} horizontal>
      {items.map((item) => (
        <Button
          className={cx(styles.button, inputActiveMode === item.key && styles.active)}
          icon={item.icon}
          iconProps={{
            color: inputActiveMode === item.key ? theme.colorPrimary : theme.colorTextSecondary,
            size: 18,
          }}
          key={item.key}
          onClick={() => handleClick(item.key)}
          shape={'round'}
        >
          {item.title}
        </Button>
      ))}
    </Center>
  );
});

export default StarterList;
