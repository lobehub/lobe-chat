/// <reference types="react" />
import { DivProps } from "../types";
import { type GridBackgroundProps } from './index';
export interface GridShowcaseProps extends DivProps {
    backgroundColor?: GridBackgroundProps['backgroundColor'];
}
declare const GridShowcase: import("react").NamedExoticComponent<GridShowcaseProps>;
export default GridShowcase;
