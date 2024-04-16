import { PropsWithChildren } from 'react';
import { DivProps } from "../types";
import { ColorLayer } from './vendor/gaussianBackground';
export interface GaussianBackgroundProps extends PropsWithChildren, DivProps {
    classNames?: {
        canvas?: string;
        content?: string;
    };
    layers: ColorLayer[];
    options?: {
        blurRadius?: number;
        fpsCap?: number;
        scale?: number;
    };
}
declare const GaussianBackground: import("react").NamedExoticComponent<GaussianBackgroundProps>;
export default GaussianBackground;
