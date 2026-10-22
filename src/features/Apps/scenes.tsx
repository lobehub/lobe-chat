'use client';

import * as stylex from '@stylexjs/stylex';

import { sx } from '@/styles/sx';

import { APP_SHOTS } from './const';
import { styles } from './style';
import themed from './style.module.css';

export const DesktopScene = () => (
  <div {...sx([styles.stage], themed.stage)}>
    <img alt="" {...sx([styles.desktopShot], themed.lightOnly)} src={APP_SHOTS.desktopLight} />
    <img alt="" {...sx([styles.desktopShot], themed.darkOnly)} src={APP_SHOTS.desktopDark} />
  </div>
);

export const MobileScene = () => (
  <div {...sx([styles.mobileStage], themed.mobileStage)}>
    <div {...sx([styles.phone], themed.phone)}>
      <img alt="" {...stylex.props(styles.phoneShot)} loading="lazy" src={APP_SHOTS.mobile} />
    </div>
  </div>
);

export const CliScene = () => (
  <img alt="" {...stylex.props(styles.cliShot)} loading="lazy" src={APP_SHOTS.cli} />
);
