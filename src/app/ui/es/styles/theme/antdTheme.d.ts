import { ThemeConfig } from 'antd';
import { ThemeAppearance } from 'antd-style';
import { NeutralColors, PrimaryColors } from "..";
export interface LobeAntdThemeParams {
    appearance: ThemeAppearance;
    neutralColor?: NeutralColors;
    primaryColor?: PrimaryColors;
}
/**
 * create A LobeHub Style Antd Theme Object
 * @param neutralColor
 * @param appearance
 * @param primaryColor
 */
export declare const createLobeAntdTheme: ({ neutralColor, appearance, primaryColor, }: LobeAntdThemeParams) => ThemeConfig;
