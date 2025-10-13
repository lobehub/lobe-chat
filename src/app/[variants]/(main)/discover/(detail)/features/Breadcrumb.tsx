'use client';

import { CopyButton } from '@lobehub/ui';
import { Breadcrumb as AntdBreadcrumb } from 'antd';
import { useTheme } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { useQuery } from '@/hooks/useQuery';
import { AssistantMarketSource, DiscoverTab } from '@/types/discover';

const Breadcrumb = memo<{ identifier: string; tab: DiscoverTab }>(({ tab, identifier }) => {
  const theme = useTheme();
  const { t } = useTranslation('discover');
  const { source } = useQuery() as { source?: AssistantMarketSource };
  const marketSource = source === 'legacy' ? 'legacy' : undefined;

  return (
    <AntdBreadcrumb
      items={[
        {
          title: (
            <Link
              href={{
                pathname: '/discover',
                query: marketSource ? { source: marketSource } : undefined,
              }}
            >
              Discover
            </Link>
          ),
        },
        {
          title: (
            <Link
              href={{
                pathname: urlJoin('/discover', tab),
                query: marketSource ? { source: marketSource } : undefined,
              }}
            >
              {tab === DiscoverTab.Mcp ? 'MCP Servers' : t(`tab.${tab}` as any)}
            </Link>
          ),
        },
        {
          title: (
            <Flexbox
              align={'center'}
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
      ]}
    />
  );
});

export default Breadcrumb;
