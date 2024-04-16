/// <reference types="react" />
import { DivProps } from "../types";
export interface StoryBookProps extends DivProps {
    /**
     * @description The Leva store instance to be used by the component
     * @type levaStore
     */
    levaStore: any;
    /**
     * @description If use padding around component
     */
    noPadding?: boolean;
}
export declare const StoryBook: import("react").NamedExoticComponent<StoryBookProps>;
export default StoryBook;
export { useControls, useCreateStore } from 'leva';
