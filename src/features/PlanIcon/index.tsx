import { Icon } from '@lobehub/ui';
import { Tag } from 'antd';
import { createStyles } from 'antd-style';
import { Atom, Box, CircleSlash, Sparkle, Zap } from 'lucide-react';
import { CSSProperties, MouseEvent, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { Plans } from '@/types/subscription';

export const themes = {
  [Plans.Free]: {
    icon: CircleSlash,
    theme: {
      background: undefined,
      color: undefined,
    },
  },
  [Plans.Hobby]: {
    icon: Box,
    theme: {
      background: 'linear-gradient(45deg, #21B2EE, #2271ED)',
      color: '#E5F8FF',
    },
  },
  [Plans.Starter]: {
    icon: Sparkle,
    theme: {
      background: 'linear-gradient(45deg, #C57948, #803718)',
      color: '#FFC385',
    },
  },
  [Plans.Premium]: {
    icon: Zap,
    theme: {
      background: 'linear-gradient(45deg, #A5B4C2, #606E7B)',
      color: '#FCFDFF',
    },
  },
  [Plans.Ultimate]: {
    icon: Atom,
    theme: {
      background: 'linear-gradient(45deg, #F7A82F, #BB7227)',
      color: '#FCFA6E',
    },
  },
};

const useStyles = createStyles(({ css, token }) => ({
  icon: css`
    flex: none;
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: 0 0 0 1px ${token.colorFillSecondary};
  `,
}));

interface PlanIconProps {
  className?: string;
  mono?: boolean;
  onClick?: (e: MouseEvent) => void;
  plan: Plans;
  size?: number;
  style?: CSSProperties;
  type?: 'icon' | 'tag' | 'combine';
}

const PlanIcon = memo<PlanIconProps>(
  ({ type = 'icon', plan, size = 36, mono, style, className, onClick }) => {
    const { icon, theme } = themes[plan];
    const { cx, styles, theme: token } = useStyles();
    const { t } = useTranslation('subscription');
    const isTag = type === 'tag';
    const isCombine = type === 'combine';
    const isFree = plan === Plans.Free;

    if (isTag) {
      return (
        <Tag
          bordered={false}
          className={className}
          onClick={onClick}
          style={{
            ...(theme || { background: token.colorFillSecondary, color: token.colorText }),
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            flex: 'none',
            margin: 0,
            ...style,
          }}
        >
          {t(`plans.plan.${plan}.title`)}
        </Tag>
      );
    }

    const iconContent = (
      <Center
        className={cx(styles.icon, className)}
        height={size}
        onClick={onClick}
        style={
          mono
            ? style
            : { ...theme, border: isFree ? undefined : `2px solid ${theme.color}`, ...style }
        }
        width={size}
      >
        <Icon color={mono ? undefined : theme.color} icon={icon} size={size / 2} />
      </Center>
    );

    if (isCombine) {
      return (
        <Flexbox align={'center'} gap={8} horizontal>
          {iconContent}
          <span>{t(`plans.plan.${plan}.title`)}</span>
        </Flexbox>
      );
    }

    return iconContent;
  },
);

export default PlanIcon;
