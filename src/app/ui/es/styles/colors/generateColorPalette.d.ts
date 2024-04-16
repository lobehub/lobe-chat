import { AliasToken } from 'antd/es/theme/interface';
import { ColorScaleItem } from "./colors";
export declare const generateColorPalette: ({ type, scale, appearance, }: {
    appearance: 'light' | 'dark';
    scale: ColorScaleItem;
    type: 'Primary' | 'Success' | 'Warning' | 'Error' | 'Info' | string;
}) => Partial<AliasToken>;
export declare const generateColorNeutralPalette: ({ scale, appearance, }: {
    appearance: 'light' | 'dark';
    scale: ColorScaleItem;
}) => Partial<AliasToken>;
