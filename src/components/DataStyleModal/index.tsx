import { Icon, Modal } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LucideIcon } from 'lucide-react';
import { rgba } from 'polished';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token, prefixCls, isDarkMode }) => ({
  modalTitle: css`
    &.${prefixCls}-modal-header {
      height: 80px;
      background:
        linear-gradient(
          180deg,
          ${rgba(token.colorBgElevated, 0)},
          ${token.colorBgContainer} ${isDarkMode ? '80' : '140'}px
        ),
        fixed 0 0 /10px 10px radial-gradient(${token.colorFill} 1px, transparent 0);
    }

    & .${prefixCls}-modal-title {
      font-size: 24px;
    }
  `,
}));

interface DataStyleModalProps {
  children: ReactNode;
  icon: LucideIcon;
  onOpenChange?: (open: boolean) => void;
  open: boolean;
  title: string;
  width?: number;
}

const DataStyleModal = memo<DataStyleModalProps>(
  ({ icon, onOpenChange, title, open, children, width = 550 }) => {
    const { styles } = useStyles();

    return (
      <Modal
        afterOpenChange={onOpenChange}
        centered
        classNames={{
          header: styles.modalTitle,
        }}
        closable={false}
        footer={null}
        open={open}
        title={
          <Flexbox gap={8} horizontal>
            <Icon icon={icon} />
            {title}
          </Flexbox>
        }
        width={width}
      >
        {children}
      </Modal>
    );
  },
);

export default DataStyleModal;
