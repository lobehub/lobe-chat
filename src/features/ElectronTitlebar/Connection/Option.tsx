import { CheckCircleFilled } from '@ant-design/icons';
import { StorageModeEnum } from '@lobechat/electron-client-ipc';
import { createStyles } from 'antd-style';
import { ComponentType, ReactNode } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ token, css }) => ({
  checked: css`
    position: relative;
    border: 1px solid ${token.colorPrimary};
  `,
  description: css`
    margin-block-start: 4px; /* Adjust spacing */
    font-size: 13px; /* Slightly larger description */
    color: ${token.colorTextSecondary};
  `,
  iconWrapper: css`
    margin-block-start: 2px;
    padding: 0;
    color: ${token.colorTextSecondary};

    svg {
      display: block;
      font-size: 24px; /* Increased icon size */
      stroke-width: 2; /* Ensure lucide icons look bolder */
    }
  `,
  label: css`
    font-size: 16px;
    font-weight: 600; /* Bolder label */
    color: ${token.colorText};
  `,
  optionCard: css`
    cursor: pointer;

    width: 100%;
    padding: 16px;
    border: 1px solid ${token.colorBorderSecondary}; /* Use secondary border */
    border-radius: ${token.borderRadiusLG}px;

    color: ${token.colorText};

    background-color: ${token.colorBgContainer};

    transition: all 0.2s ${token.motionEaseInOut};

    :hover {
      border-color: ${token.colorPrimary};
    }
  `,
  optionInner: css`
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;
  `,
}));

export interface OptionProps {
  children?: ReactNode;
  description: string;
  icon: ComponentType<any>;
  isSelected: boolean;
  label: string;
  onClick: (value: StorageModeEnum) => void;
  value: StorageModeEnum; // For self-hosted input
}

export const Option = ({
  description,
  icon: PrefixIcon,
  label,
  value,
  isSelected,
  onClick,
  children,
}: OptionProps) => {
  const { styles, cx } = useStyles();

  return (
    <Flexbox
      className={cx(styles.optionCard, isSelected && styles.checked)}
      direction="vertical"
      key={value}
      onClick={() => onClick(value)}
    >
      <div className={styles.optionInner}>
        <Flexbox gap={16} horizontal>
          <Center className={styles.iconWrapper}>
            <PrefixIcon />
          </Center>
          <Flexbox gap={8}>
            <div className={styles.label}>{label}</div>
            <div className={styles.description}>{description}</div>
          </Flexbox>
        </Flexbox>
        {isSelected && <CheckCircleFilled style={{ fontSize: 16 }} />}
      </div>
      {children}
    </Flexbox>
  );
};
