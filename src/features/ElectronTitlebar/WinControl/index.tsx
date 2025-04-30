import { CloseOutlined, MinusOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import type { FC } from 'react';
import { Flexbox } from 'react-layout-kit';

import { TITLE_BAR_HEIGHT } from '../const';

const useStyles = createStyles(({ css, cx, token }) => {
  const icon = css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    min-height: ${TITLE_BAR_HEIGHT}px;
    transition: all ease-in-out 100ms;
    -webkit-app-region: no-drag;
    &:hover {
      background: ${token.colorFillTertiary};
    }
    &:active {
      background: ${token.colorFillSecondary};
    }
  `;
  return {
    close: cx(
      icon,
      css`
        &:hover {
          color: ${token.colorTextLightSolid};
          /* win11 的色值，亮暗色均不变 */
          background: #d33328;
        }

        &:active {
          color: ${token.colorTextLightSolid};
          /* win11 的色值 */
          background: #8b2b25;
        }
      `,
    ),
    container: css`
      cursor: pointer;
    `,
    icon,
  };
});

export interface IControlProps {
  maximizable?: boolean;
  minimizable?: boolean;
  onClose?: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
}

const WinControl: FC<IControlProps> = ({ minimizable, onMinimize, onClose }) => {
  const { styles } = useStyles();
  return (
    <Flexbox className={styles.container}>
      {minimizable ? (
        <div className={styles.icon} onClick={onMinimize}>
          <MinusOutlined twoToneColor={'#506478'} />
        </div>
      ) : null}

      <div className={styles.close} onClick={onClose}>
        <CloseOutlined twoToneColor={'#506478'} />
      </div>
    </Flexbox>
  );
};

export default WinControl;
