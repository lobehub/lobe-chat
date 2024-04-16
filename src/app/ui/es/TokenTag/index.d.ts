/// <reference types="react" />
import { DivProps } from "../types";
export interface TokenTagProps extends DivProps {
    /**
     * @default 'left'
     */
    displayMode?: 'remained' | 'used';
    /**
     * @description Maximum value for the token
     */
    maxValue: number;
    shape?: 'round' | 'square';
    text?: {
        overload?: string;
        remained?: string;
        used?: string;
    };
    unoptimized?: boolean;
    /**
     * @description Current value of the token
     */
    value: number;
}
declare const TokenTag: import("react").ForwardRefExoticComponent<TokenTagProps & import("react").RefAttributes<HTMLDivElement>>;
export default TokenTag;
