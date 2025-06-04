'use client';

import { Anchor, AnchorProps } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useMemo } from 'react';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/discover/features/const';
import { isOnServerSide } from '@/utils/env';

import { createTOCTree } from './useToc';

const useStyles = createStyles(({ css, token, responsive, prefixCls }) => {
  return {
    toc: css`
      a {
        line-height: 1.4 !important;
        white-space: normal !important;
      }

      .${prefixCls}-anchor {
        display: flex;
        flex-direction: column;
        gap: 8px;

        &::before {
          display: none;
        }

        .${prefixCls}-anchor-ink {
          display: none !important;
        }

        .${prefixCls}-anchor-link-title {
          overflow: hidden;
          display: box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;

          word-break: break-word;
        }

        .${prefixCls}-anchor-link-title,.${prefixCls}-anchor-link {
          margin: 0 !important;
          padding-block: 0 !important;
        }

        > .${prefixCls}-anchor-link {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-inline-start: 0 !important;
        }

        .${prefixCls}-anchor-link-title-active {
          color: ${token.colorText} !important;
        }

        .${prefixCls}-anchor-link-title:not(.${prefixCls}-anchor-link-title-active) {
          color: ${token.colorTextSecondary};

          &:hover {
            color: ${token.colorText};
          }
        }
      }

      ${responsive.lg} {
        display: none;
      }
    `,
  };
});

const Toc = memo<AnchorProps>(({ items, className, ...rest }) => {
  const { cx, styles } = useStyles();

  const toc = useMemo(() => createTOCTree(items as any), [items]);

  return (
    <Anchor
      affix={false}
      className={cx(className, styles.toc)}
      getContainer={
        isOnServerSide ? undefined : () => document.querySelector(`#${SCROLL_PARENT_ID}`) as any
      }
      items={toc}
      {...rest}
    />
  );
});

export default Toc;
