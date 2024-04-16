/// <reference types="react" />
import { DivProps } from "../types";
declare enum Line {
    l7 = 0,
    l6 = 1,
    l5 = 2,
    l4 = 3,
    l3 = 4,
    l2 = 5,
    l1 = 6,
    center = 7,
    r1 = 8,
    r2 = 9,
    r3 = 10,
    r4 = 11,
    r5 = 12,
    r6 = 13,
    r7 = 14
}
export interface GridProps extends DivProps {
    color?: string;
    linePick?: Line;
    strokeWidth?: number;
}
declare const Grid: import("react").NamedExoticComponent<GridProps>;
export default Grid;
