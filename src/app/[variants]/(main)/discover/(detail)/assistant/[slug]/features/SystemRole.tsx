'use client';

import { Markdown } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Block from '../../../features/Block';

const SystemRole = memo<{ children?: string }>(({ children }) => {
  const { t } = useTranslation('discover');
  const theme = useTheme();

  return (
    <Block title={t('assistants.systemRole')}>
      {children ? (
        <Markdown
          fontSize={theme.fontSize}
          style={{
            border: `1px solid ${theme.colorBorderSecondary}`,
            borderRadius: theme.borderRadiusLG,
            paddingInline: 16,
          }}
        >
          {children}
        </Markdown>
      ) : (
        <Skeleton paragraph={{ rows: 4 }} title={false} />
      )}
    </Block>
  );
});

export default SystemRole;
