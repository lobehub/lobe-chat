'use client';

import { Icon, Text } from '@lobehub/ui';
import { Breadcrumb, BreadcrumbProps } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import BackButton, { BACK_BUTTON_ID } from './components/BackButton';
import TogglePanelButton from './components/TogglePanelButton';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  breadcrumb: css`
    ol {
      align-items: center;
    }
    .${prefixCls}-breadcrumb-separator {
      margin-inline: 4px;
    }
    .${prefixCls}-breadcrumb-link {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: ${token.colorTextDescription};
    }
    a.${prefixCls}-breadcrumb-link {
      &:hover {
        color: ${token.colorText};
      }
    }
  `,
  container: css`
    overflow: hidden;

    #${BACK_BUTTON_ID} {
      width: 0 !important;
      opacity: 0;
      transition: all 0.2s ${token.motionEaseOut};
    }

    &:hover {
      #${BACK_BUTTON_ID} {
        width: 24px !important;
        opacity: 1;
      }
    }
  `,
}));

interface SideBarHeaderLayoutProps {
  backTo?: string;
  breadcrumb?: BreadcrumbProps['items'];
  left?: ReactNode;
  right?: ReactNode;
  showBack?: boolean;
}

const SideBarHeaderLayout = memo<SideBarHeaderLayoutProps>(
  ({ left, right, backTo = '/', showBack = true, breadcrumb = [] }) => {
    const { styles } = useStyles();
    const navigate = useNavigate();
    const leftContent = left ? (
      <Flexbox
        align={'center'}
        flex={1}
        gap={2}
        horizontal
        style={{
          overflow: 'hidden',
        }}
      >
        {showBack && (
          <BackButton
            size={{
              blockSize: 32,
              size: 16,
            }}
            to={backTo}
          />
        )}
        {left && typeof left === 'string' ? (
          <Text ellipsis fontSize={16} weight={500}>
            {left}
          </Text>
        ) : (
          left
        )}
      </Flexbox>
    ) : (
      <Flexbox flex={1} paddingInline={6}>
        <Breadcrumb
          className={styles.breadcrumb}
          items={[
            {
              href: '/',
              title: <Icon icon={HomeIcon} />,
            },
            ...breadcrumb,
          ].map((item) => ({
            ...item,
            onClick: (event) => {
              if (item.href) {
                event.preventDefault();
                event.stopPropagation();
                return navigate(item.href);
              }
            },
          }))}
          separator={<Icon icon={ChevronRightIcon} />}
        />
      </Flexbox>
    );

    return (
      <Flexbox
        align={'center'}
        className={styles.container}
        flex={'none'}
        horizontal
        justify={'space-between'}
        padding={6}
      >
        {leftContent}
        <Flexbox
          align={'center'}
          gap={2}
          horizontal
          justify={'flex-end'}
          style={{
            overflow: 'hidden',
          }}
        >
          <TogglePanelButton />
          {right}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default SideBarHeaderLayout;
