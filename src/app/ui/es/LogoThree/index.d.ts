import { type SplineProps } from '@splinetool/react-spline';
import { CSSProperties } from 'react';
export interface LogoThreeProps extends Partial<SplineProps> {
    className?: string;
    size?: number;
    style?: CSSProperties;
}
declare const LogoThree: import("react").NamedExoticComponent<LogoThreeProps>;
export default LogoThree;
