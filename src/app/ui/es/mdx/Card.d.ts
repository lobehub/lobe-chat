import { FC } from 'react';
import { type FlexboxProps } from 'react-layout-kit';
import { type IconProps } from "../Icon";
export interface CardProps extends Omit<FlexboxProps, 'children'> {
    desc?: string;
    href?: string;
    icon?: IconProps['icon'];
    iconProps?: Omit<IconProps, 'icon'>;
    image?: string;
    title: string;
}
declare const Card: FC<CardProps>;
export default Card;
