'use client';

import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { CSSProperties, ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SidebarHeader from '@/components/SidebarHeader';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

export const useStyles = createStyles(({ css, token }) => ({
  chevron: css`
    transition: transform 0.2s ${token.motionEaseInOut};
  `,
  chevronExpanded: css`
    transform: rotate(90deg);
  `,
  container: css`
    position: relative;
    overflow: hidden auto;
    transition: all 0.2s ${token.motionEaseInOut};
  `,
}));

export interface ConfigLayoutProps {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  containerStyle?: CSSProperties;
  expandedHeight?: number | string;
  headerStyle?: CSSProperties;
  onHeaderClick?: () => void;
  sessionId: string;
  title: ReactNode;
}

const ConfigLayout = memo<ConfigLayoutProps>(
  ({
    title,
    actions,
    sessionId,
    className,
    headerStyle,
    containerStyle,
    expandedHeight,
    onHeaderClick,
    children,
  }) => {
    const { styles } = useStyles();
    const [expanded, toggleAgentSystemRoleExpand] = useGlobalStore((s) => [
      systemStatusSelectors.getAgentSystemRoleExpanded(sessionId)(s),
      s.toggleAgentSystemRoleExpand,
    ]);

    const handleHeaderClick = () => {
      toggleAgentSystemRoleExpand(sessionId);
      onHeaderClick?.();
    };

    const computedStyle: CSSProperties = expanded
      ? {
          minHeight: 232,
          opacity: 1,
          ...(expandedHeight !== undefined ? { maxHeight: expandedHeight } : {}),
        }
      : {
          minHeight: 0,
          opacity: 0,
          ...(expandedHeight !== undefined ? { maxHeight: 0 } : {}),
        };

    const combinedActions = (
      <Flexbox align="center" gap={2} horizontal>
        {actions}
        <ActionIcon
          className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ''}`}
          icon={ChevronRight}
          onClick={handleHeaderClick}
          size="small"
          style={{
            pointerEvents: 'none',
          }}
        />
      </Flexbox>
    );

    return (
      <Flexbox className={className} height={'fit-content'}>
        <SidebarHeader
          actions={combinedActions}
          onClick={handleHeaderClick}
          style={{
            cursor: 'pointer',
            ...headerStyle,
          }}
          title={title}
        />
        <Flexbox
          className={styles.container}
          style={{
            ...computedStyle,
            ...containerStyle,
          }}
        >
          {children}
        </Flexbox>
      </Flexbox>
    );
  },
);

ConfigLayout.displayName = 'ConfigLayout';

export default ConfigLayout;
