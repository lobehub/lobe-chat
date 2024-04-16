import { ReactNode } from 'react';
import { DivProps } from "../types";
export interface SpotlightCardProps<T = any> extends DivProps {
    borderRadius?: number;
    columns?: number;
    gap?: number | string;
    items: T[];
    maxItemWidth?: string | number;
    renderItem: (item: T) => ReactNode;
    size?: number;
    spotlight?: boolean;
}
declare const SpotlightCard: import("react").NamedExoticComponent<SpotlightCardProps<any>>;
export default SpotlightCard;
