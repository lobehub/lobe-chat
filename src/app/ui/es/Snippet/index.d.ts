/// <reference types="react" />
import { DivProps } from "../types";
export interface SnippetProps extends DivProps {
    /**
     * @description The content to be displayed inside the Snippet component
     */
    children: string;
    /**
     * @description Whether the Snippet component is copyable or not
     * @default true
     */
    copyable?: boolean;
    /**
     * @description The language of the content inside the Snippet component
     * @default 'tsx'
     */
    language?: string;
    /**
     * @description Whether add spotlight background
     * @default false
     */
    spotlight?: boolean;
    /**
     * @description The symbol to be displayed before the content inside the Snippet component
     */
    symbol?: string;
    /**
     * @description The type of the Snippet component
     * @default 'ghost'
     */
    type?: 'ghost' | 'block';
}
declare const Snippet: import("react").NamedExoticComponent<SnippetProps>;
export default Snippet;
