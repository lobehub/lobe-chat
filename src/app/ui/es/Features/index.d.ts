import { CSSProperties } from 'react';
import { SpotlightCardProps } from "../SpotlightCard";
import { DivProps } from "../types";
import { type FeatureItem } from './Item';
export type { FeatureItem } from './Item';
export interface FeaturesProps extends DivProps {
    columns?: SpotlightCardProps['columns'];
    gap?: SpotlightCardProps['gap'];
    /**
     * @description The class name of the item
     */
    itemClassName?: string;
    /**
     * @description The style of the item
     */
    itemStyle?: CSSProperties;
    /**
     * @description The array of feature items
     */
    items: FeatureItem[];
    maxWidth?: number;
}
declare const Features: import("react").NamedExoticComponent<FeaturesProps>;
export default Features;
