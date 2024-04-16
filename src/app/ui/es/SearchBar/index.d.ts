/// <reference types="react" />
import { type InputProps } from "../Input";
export interface SearchBarProps extends InputProps {
    defaultValue?: string;
    /**
     * @description Whether to enable the shortcut key to focus on the input
     * @default false
     */
    enableShortKey?: boolean;
    onInputChange?: (value: string) => void;
    /**
     * @description The shortcut key to focus on the input. Only works if `enableShortKey` is true
     * @default 'f'
     */
    shortKey?: string;
    /**
     * @description Whether add spotlight background
     * @default false
     */
    spotlight?: boolean;
    value?: string;
}
declare const SearchBar: import("react").NamedExoticComponent<SearchBarProps>;
export default SearchBar;
