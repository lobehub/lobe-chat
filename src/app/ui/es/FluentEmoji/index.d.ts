/// <reference types="react" />
import { DivProps } from "../types";
export interface FluentEmojiProps extends DivProps {
    /**
     * @description The emoji character to be rendered
     */
    emoji: string;
    /**
     * @description Size of the emoji
     * @default 40
     */
    size?: number;
    /**
     * @description The type of the FluentUI emoji set to be used
     * @default '3d'
     */
    type?: 'modern' | 'flat' | 'high-contrast' | 'anim' | '3d' | 'pure';
    unoptimized?: boolean;
}
declare const FluentEmoji: import("react").NamedExoticComponent<FluentEmojiProps>;
export default FluentEmoji;
