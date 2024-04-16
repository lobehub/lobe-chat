import { CSSProperties } from 'react';
import { IconProps } from "../Icon";
import type { DivProps } from "../types";
export interface FeatureItem {
    /**
     * @description The number of columns the item spans.
     */
    column?: number;
    /**
     * @description The description of the feature item.
     */
    description?: string;
    /**
     * @description Whether this item is a hero item.
     */
    hero?: boolean;
    /**
     * @description The name of the icon to display on the feature item.
     */
    icon?: IconProps['icon'];
    /**
     * @description The URL of the image to display on the feature item.
     */
    image?: string;
    /**
     * @description The CSS style of the image to display on the feature item.
     */
    imageStyle?: CSSProperties;
    /**
     * @description The type of the image to display on the feature item.
     * @default 'normal'
     */
    imageType?: 'light' | 'primary' | 'soon';
    /**
     * @description The link to navigate to when clicking on the feature item.
     */
    link?: string;
    /**
     * @description Whether to open the link in a new tab when clicking on the feature item.
     * @default false
     */
    openExternal?: boolean;
    /**
     * @description The number of rows the item spans.
     */
    row?: number;
    /**
     * @description The title of the feature item.
     */
    title: string;
}
export interface FeatureItemProps extends FeatureItem, DivProps {
}
declare const Item: import("react").NamedExoticComponent<FeatureItemProps>;
export default Item;
