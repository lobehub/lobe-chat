/// <reference types="react" />
import { type FlexboxProps } from 'react-layout-kit';
import { type IconProps, type IconSizeConfig, type IconSizeType, LucideIconProps } from "../Icon";
import { type TooltipProps } from "../Tooltip";
interface ActionIconSizeConfig extends IconSizeConfig {
    blockSize?: number | string;
    borderRadius?: number | string;
}
type ActionIconSizeType = 'site' | IconSizeType;
export type ActionIconSize = ActionIconSizeType | ActionIconSizeConfig;
export interface ActionIconProps extends LucideIconProps, FlexboxProps {
    /**
     * @description Whether the icon is active or not
     * @default false
     */
    active?: boolean;
    /**
     * @description Change arrow's visible state and change whether the arrow is pointed at the center of target.
     * @default false
     */
    arrow?: boolean;
    disable?: boolean;
    /**
     * @description Glass blur style
     * @default 'false'
     */
    glass?: boolean;
    icon?: IconProps['icon'];
    /**
     * @description Set the loading status of ActionIcon
     */
    loading?: boolean;
    /**
     * @description The position of the tooltip relative to the target
     * @enum ["top","left","right","bottom","topLeft","topRight","bottomLeft","bottomRight","leftTop","leftBottom","rightTop","rightBottom"]
     * @default "top"
     */
    placement?: TooltipProps['placement'];
    /**
     * @description Size of the icon
     * @default 'normal'
     */
    size?: ActionIconSize;
    spin?: boolean;
    /**
     * @description Whether add spotlight background
     * @default false
     */
    spotlight?: boolean;
    /**
     * @description The text shown in the tooltip
     */
    title?: string;
    /**
     * @description Mouse enter delay of tooltip
     * @default 0.5
     */
    tooltipDelay?: number;
}
declare const ActionIcon: import("react").ForwardRefExoticComponent<ActionIconProps & import("react").RefAttributes<HTMLDivElement>>;
export default ActionIcon;
