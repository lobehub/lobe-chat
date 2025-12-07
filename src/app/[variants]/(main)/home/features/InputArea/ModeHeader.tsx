import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { BotIcon, ImageIcon, MicroscopeIcon, PenLineIcon, X } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { type StarterMode, useHomeStore } from '@/store/home';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-block: 6px;
    padding-inline: 12px;
    border-block-end: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorFillQuaternary};
  `,
  title: css`
    font-size: 13px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
  `,
}));

const modeConfig: Record<NonNullable<StarterMode>, { icon: typeof BotIcon; title: string }> = {
  agent: { icon: BotIcon, title: '创建助理' },
  image: { icon: ImageIcon, title: '绘画' },
  research: { icon: MicroscopeIcon, title: '探究' },
  write: { icon: PenLineIcon, title: '写作' },
};

const ModeHeader = memo(() => {
  const { styles, theme } = useStyles();

  const [inputActiveMode, clearInputMode] = useHomeStore((s) => [
    s.inputActiveMode,
    s.clearInputMode,
  ]);

  if (!inputActiveMode) return null;

  const config = modeConfig[inputActiveMode];
  const Icon = config.icon;

  return (
    <Flexbox align="center" className={styles.container} horizontal justify="space-between">
      <Flexbox align="center" gap={6} horizontal>
        <Icon color={theme.colorPrimary} size={14} />
        <span className={styles.title}>{config.title}</span>
      </Flexbox>
      <ActionIcon icon={X} onClick={clearInputMode} size="small" />
    </Flexbox>
  );
});

export default ModeHeader;
