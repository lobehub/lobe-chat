'use client';

import { CopyButton } from '@lobehub/ui';
import { Breadcrumb as AntdBreadcrumb, type BreadcrumbProps } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';

import { DiscoverTab } from '@/types/discover';

const Breadcrumb = memo<{ identifier: string; tab: DiscoverTab }>(({ tab, identifier }) => {
  const theme = useTheme();
  const { t } = useTranslation('discover');

  const tabLabel = useMemo(() => {
    if (tab === DiscoverTab.Mcp) return 'MCP Servers';
    if (tab === DiscoverTab.User) return t('tab.user');
    return t(`tab.${tab}` as any);
  }, [tab, t]);

  // For user tab, we don't show the middle breadcrumb as there's no user list page
  const items: BreadcrumbProps['items'] = useMemo(() => {
    if (tab === DiscoverTab.User) {
      return [
        {
          title: <Link to="/discover">Discover</Link>,
        },
        {
          title: (
            <Flexbox
              align="center"
              gap={4}
              horizontal
              style={{
                color: theme.colorTextSecondary,
              }}
            >
              @{identifier}
            </Flexbox>
          ),
        },
      ];
    }

    return [
      {
        title: <Link to="/discover">Discover</Link>,
      },
      {
        title: <Link to={`/discover/${tab}`}>{tabLabel}</Link>,
      },
      {
        title: (
          <Flexbox
            align="center"
            gap={4}
            horizontal
            style={{
              color: theme.colorTextSecondary,
            }}
          >
            {identifier}
            <CopyButton
              content={identifier}
              size={{
                blockSize: 22,
                size: 14,
              }}
            />
          </Flexbox>
        ),
      },
    ];
  }, [tab, identifier, tabLabel, theme.colorTextSecondary]);

  return <AntdBreadcrumb items={items} />;
});

export default Breadcrumb;
