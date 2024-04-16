/// <reference types="react" />
import { type FlexboxProps } from 'react-layout-kit';
export declare const useStyles: (props?: {
    gap: string | number;
    maxItemWidth: string | number;
    rows: number;
} | undefined) => import("antd-style").ReturnStyles<{
    container: import("antd-style").SerializedStyles;
}>;
export interface GridProps extends Omit<FlexboxProps, 'gap'> {
    gap?: string | number;
    maxItemWidth?: string | number;
    rows?: number;
}
declare const Grid: import("react").ForwardRefExoticComponent<GridProps & import("react").RefAttributes<HTMLDivElement>>;
export default Grid;
