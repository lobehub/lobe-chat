/// <reference types="react" />
import { LucideIcon, LucideProps } from 'lucide-react';
import { DivProps } from "../types";
export interface IconSizeConfig extends Pick<LucideProps, 'strokeWidth' | 'absoluteStrokeWidth'> {
    fontSize?: number | string;
}
export type IconSizeType = 'large' | 'normal' | 'small';
export type IconSize = IconSizeType | IconSizeConfig;
export type LucideIconProps = Pick<LucideProps, 'fill' | 'fillRule' | 'fillOpacity' | 'color' | 'focusable'>;
export interface IconProps extends DivProps, LucideIconProps {
    /**
     * @description The icon element to be rendered
     * @type LucideIcon
     */
    icon: LucideIcon;
    /**
     * @description Size of the icon
     * @default 'normal'
     */
    size?: IconSize;
    /**
     * @description Rotate icon with animation
     * @default false
     */
    spin?: boolean;
}
declare const Icon: import("react").ForwardRefExoticComponent<IconProps & import("react").RefAttributes<SVGSVGElement>>;
export default Icon;
