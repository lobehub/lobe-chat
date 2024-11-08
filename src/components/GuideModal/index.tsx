'use client';

import { ConfigProvider, Modal, type ModalProps } from 'antd';
import { createStyles } from 'antd-style';
import { lighten } from 'polished';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token, prefixCls }) => {
  return {
    content: css`
      .${prefixCls}-modal-footer {
        margin: 0;
        padding: 16px;
      }
      .${prefixCls}-modal-header {
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: center;

        height: 56px;
        margin-block-end: 0;
        padding: 16px;
      }
      .${prefixCls}-modal-content {
        overflow: hidden;
        padding: 0;
        border: 1px solid ${token.colorSplit};
        border-radius: ${token.borderRadiusLG}px;
      }
    `,
    wrap: css`
      overflow: hidden auto;
    `,
  };
});

interface GuideModalProps extends ModalProps {
  cover: ReactNode;
  desc: ReactNode;
  title: ReactNode;
}

const GuideModal = memo<GuideModalProps>(
  ({ className, title, desc, cover, width = 360, ...rest }) => {
    const { styles, cx, theme } = useStyles();
    return (
      <ConfigProvider
        theme={{
          token: {
            colorBgElevated: lighten(0.005, theme.colorBgContainer),
          },
        }}
      >
        <Modal
          centered
          className={cx(styles.content, className)}
          closable={false}
          maskClosable
          width={width}
          wrapClassName={styles.wrap}
          {...rest}
        >
          {cover}
          <Flexbox padding={16}>
            <h3 style={{ fontWeight: 'bold' }}>{title}</h3>
            <p style={{ marginBottom: 0 }}>{desc}</p>
          </Flexbox>
        </Modal>
      </ConfigProvider>
    );
  },
);

export default GuideModal;
