import { type SplineProps } from '@splinetool/react-spline';
import { CSSProperties } from 'react';
export interface LogoSplineProps extends Partial<SplineProps> {
    className?: string;
    height?: number | string;
    style?: CSSProperties;
    width?: number | string;
}
declare const LogoSpline: import("react").NamedExoticComponent<LogoSplineProps>;
export default LogoSpline;
