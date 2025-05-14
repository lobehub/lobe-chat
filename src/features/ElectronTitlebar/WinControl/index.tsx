import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Minus, Square, XIcon } from 'lucide-react';

import { electronSystemService } from '@/services/electron/system';

import { TITLE_BAR_HEIGHT } from '../const';

const useStyles = createStyles(({ css, cx, token }) => {
  const icon = css`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 40px;
    min-height: ${TITLE_BAR_HEIGHT}px;

    color: ${token.colorTextSecondary};

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
      display: flex;
    `,
    icon,
  };
});

const WinControl = () => {
  const { styles } = useStyles();
  return (
    <div className={styles.container}>
      <div
        className={styles.icon}
        onClick={() => {
          electronSystemService.minimizeWindow();
        }}
      >
        <Icon icon={Minus} style={{ fontSize: 18 }} />
      </div>
      <div
        className={styles.icon}
        onClick={() => {
          electronSystemService.maximizeWindow();
        }}
      >
        <Icon icon={Square} />
      </div>
      <div
        className={styles.close}
        onClick={() => {
          electronSystemService.closeWindow();
        }}
      >
        <Icon icon={XIcon} style={{ fontSize: 18 }} />
      </div>
    </div>
  );
};

export default WinControl;
