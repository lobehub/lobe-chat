/// <reference types="react" />
import { ThemeMode } from 'antd-style';
import { type ActionIconSize } from "../ActionIcon";
import { DivProps } from "../types";
export interface ThemeSwitchProps extends DivProps {
    labels?: {
        auto: string;
        dark: string;
        light: string;
    };
    /**
     * @description Callback function when the theme mode is switched
     * @type {(themeMode: ThemeMode) => void}
     */
    onThemeSwitch: (themeMode: ThemeMode) => void;
    /**
     * @description Size of the action icon
     * @default {
     *   blockSize: 34,
     *   fontSize: 20,
     *   strokeWidth: 1.5,
     * }
     */
    size?: ActionIconSize;
    /**
     * @description The theme mode of the component
     * @type ThemeMode
     */
    themeMode: ThemeMode;
    type?: 'icon' | 'select';
}
declare const ThemeSwitch: import("react").NamedExoticComponent<ThemeSwitchProps>;
export default ThemeSwitch;
