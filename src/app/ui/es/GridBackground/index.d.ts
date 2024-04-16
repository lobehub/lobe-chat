/// <reference types="react" />
import { DivProps } from "../types";
export interface GridBackgroundProps extends DivProps {
    animation?: boolean;
    animationDuration?: number;
    backgroundColor?: string;
    colorBack?: string;
    colorFront?: string;
    flip?: boolean;
    random?: boolean;
    reverse?: boolean;
    showBackground?: boolean;
    strokeWidth?: number;
}
declare const GridBackground: import("react").NamedExoticComponent<GridBackgroundProps>;
export default GridBackground;
