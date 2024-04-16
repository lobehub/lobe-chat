import { ThemeProviderProps as AntdThemeProviderProps, CustomStylishParams, CustomTokenParams } from 'antd-style';
import { CSSProperties } from 'react';
import { NeutralColors, PrimaryColors } from "../styles";
export interface ThemeProviderProps extends Omit<AntdThemeProviderProps<any>, 'theme'> {
    className?: string;
    customStylish?: (theme: CustomStylishParams) => {
        [key: string]: any;
    };
    customTheme?: {
        neutralColor?: NeutralColors;
        primaryColor?: PrimaryColors;
    };
    /**
     * @description Custom extra token
     */
    customToken?: (theme: CustomTokenParams) => {
        [key: string]: any;
    };
    enableGlobalStyle?: boolean;
    enableWebfonts?: boolean;
    style?: CSSProperties;
    /**
     * @description Webfont loader css strings
     */
    webfonts?: string[];
}
declare const ThemeProvider: import("react").NamedExoticComponent<ThemeProviderProps>;
export default ThemeProvider;
