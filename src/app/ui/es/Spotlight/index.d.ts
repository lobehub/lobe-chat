/// <reference types="react" />
import { DivProps } from "../types";
export interface SpotlightProps extends DivProps {
    /**
     * @description The size of the spotlight circle
     * @default 64
     */
    size?: number;
}
declare const Spotlight: import("react").NamedExoticComponent<SpotlightProps>;
export default Spotlight;
