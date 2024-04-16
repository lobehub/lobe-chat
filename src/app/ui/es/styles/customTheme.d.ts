export declare const primaryColors: {
    blue: string;
    cyan: string;
    geekblue: string;
    gold: string;
    green: string;
    lime: string;
    magenta: string;
    orange: string;
    purple: string;
    red: string;
    volcano: string;
    yellow: string;
};
export type PrimaryColorsObj = typeof primaryColors;
export type PrimaryColors = keyof PrimaryColorsObj;
export declare const primaryColorsSwatches: string[];
export declare const neutralColors: {
    mauve: string;
    olive: string;
    sage: string;
    sand: string;
    slate: string;
};
export declare const neutralColorsSwatches: string[];
export type NeutralColorsObj = typeof neutralColors;
export type NeutralColors = keyof NeutralColorsObj;
export declare const findCustomThemeName: (type: 'primary' | 'neutral', value: string) => string | undefined;
