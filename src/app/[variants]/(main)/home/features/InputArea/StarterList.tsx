import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { Button, ButtonProps, Center, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { BotIcon, ImageIcon, MicroscopeIcon, PenLineIcon, UsersIcon } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

type StarterTitleKey =
  | 'starter.createAgent'
  | 'starter.createGroup'
  | 'starter.write'
  | 'starter.image'
  | 'starter.deepResearch';

interface StarterItem {
  disabled?: boolean;
  icon?: ButtonProps['icon'];
  key: StarterMode;
  titleKey: StarterTitleKey;
}

const StarterList = memo(() => {
  const { styles, cx, theme } = useStyles();
  const navigate = useNavigate();
  const { t } = useTranslation('home');

  useInitBuiltinAgent(BUILTIN_AGENT_SLUGS.agentBuilder);
  useInitBuiltinAgent(BUILTIN_AGENT_SLUGS.groupAgentBuilder);

  const [inputActiveMode, setInputActiveMode] = useHomeStore((s) => [
    s.inputActiveMode,
    s.setInputActiveMode,
  ]);

  const items: StarterItem[] = useMemo(
    () => [
      {
        icon: BotIcon,
        key: 'agent',
        titleKey: 'starter.createAgent',
      },
      {
        icon: UsersIcon,
        key: 'group',
        titleKey: 'starter.createGroup',
      },
      {
        icon: PenLineIcon,
        key: 'write',
        titleKey: 'starter.write',
      },
      {
        icon: ImageIcon,
        key: 'image',
        titleKey: 'starter.image',
      },
      {
        disabled: true,
        icon: MicroscopeIcon,
        key: 'research',
        titleKey: 'starter.deepResearch',
      },
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
            {t(item.titleKey)}
          </Button>
        );

        if (item.disabled) {
          return (
            <Tooltip key={item.key} title={t('starter.developing')}>
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
