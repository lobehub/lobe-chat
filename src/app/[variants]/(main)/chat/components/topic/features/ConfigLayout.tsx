'use client';

import { ScrollShadow } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { CSSProperties, ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SidebarHeader from '@/components/SidebarHeader';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

export const useStyles = createStyles(({ css }) => ({
  container: css`
    position: relative;
    transition:
      height 0.3s ease,
      opacity 0.3s ease;
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

    return (
      <Flexbox className={className} height={'fit-content'}>
        <SidebarHeader
          actions={actions}
          onClick={handleHeaderClick}
          style={{
            cursor: 'pointer',
            ...headerStyle,
          }}
          title={title}
        />
        <ScrollShadow
          className={styles.container}
          size={12}
          style={{
            transition: 'all 0.3s ease',
            ...computedStyle,
            ...containerStyle,
          }}
        >
          {children}
        </ScrollShadow>
      </Flexbox>
    );
  },
);

ConfigLayout.displayName = 'ConfigLayout';

export default ConfigLayout;
