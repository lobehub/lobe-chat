import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { Button, ButtonProps } from '@lobehub/ui';
import { Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import { BotIcon, ImageIcon, MicroscopeIcon, PenLineIcon } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { Center } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useInitBuiltinAgent } from '@/hooks/useInitBuiltinAgent';
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
  disabled?: boolean;
  icon?: ButtonProps['icon'];
  key: StarterMode;
  title: string;
}

const StarterList = memo(() => {
  const { styles, cx, theme } = useStyles();
  const navigate = useNavigate();

  useInitBuiltinAgent(BUILTIN_AGENT_SLUGS.agentBuilder);

  const [inputActiveMode, setInputActiveMode] = useHomeStore((s) => [
    s.inputActiveMode,
    s.setInputActiveMode,
  ]);

  const items: StarterItem[] = useMemo(
    () => [
      {
        icon: BotIcon,
        key: 'agent',
        title: '创建 Agent',
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
        disabled: true,
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
      // Special case: image mode navigates to /image page
      if (key === 'image') {
        navigate('/image');
        return;
      }

      // Special case: write mode navigates to /page
      if (key === 'write') {
        navigate('/page');
        return;
      }

      // Toggle mode: if clicking the active mode, clear it; otherwise set it
      if (inputActiveMode === key) {
        setInputActiveMode(null);
      } else {
        setInputActiveMode(key);
      }
    },
    [inputActiveMode, setInputActiveMode, navigate],
  );

  return (
    <Center gap={8} horizontal>
      {items.map((item) => {
        const button = (
          <Button
            className={cx(styles.button, inputActiveMode === item.key && styles.active)}
            disabled={item.disabled}
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
        );

        if (item.disabled) {
          return (
            <Tooltip key={item.key} title="正在开发中">
              {button}
            </Tooltip>
          );
        }

        return button;
      })}
    </Center>
  );
});

export default StarterList;
