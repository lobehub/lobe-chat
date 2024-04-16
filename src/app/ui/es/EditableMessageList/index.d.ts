/// <reference types="react" />
import { LLMMessage } from "../types/llm";
export interface EditableMessageListProps {
    /**
     * @description The data sources to be rendered
     */
    dataSources: LLMMessage[];
    /**
     * @description Whether the component is disabled or not
     * @default false
     */
    disabled?: boolean;
    /**
     * @description Callback function triggered when the data sources are changed
     * @param chatMessages - the updated data sources
     */
    onChange?: (chatMessages: LLMMessage[]) => void;
}
export declare const EditableMessageList: import("react").NamedExoticComponent<EditableMessageListProps>;
export default EditableMessageList;
