import { ChatMessageError } from "../types/chatMessage";
import { LLMMessage, LLMRoleType } from "../types/llm";
export type MessageDispatch = {
    message: LLMMessage;
    type: 'addMessage';
} | {
    index: number;
    message: LLMMessage;
    type: 'insertMessage';
} | {
    index: number;
    type: 'deleteMessage';
} | {
    type: 'resetMessages';
} | {
    index: number;
    message: string;
    type: 'updateMessage';
} | {
    index: number;
    role: LLMRoleType;
    type: 'updateMessageRole';
} | {
    message: string;
    type: 'addUserMessage';
} | {
    responseStream: string[];
    type: 'updateLatestBotMessage';
} | {
    index: number;
    message: string;
    type: 'updateMessageChoice';
} | {
    error: ChatMessageError | undefined;
    index: number;
    type: 'setErrorMessage';
};
export declare const messagesReducer: (state: LLMMessage[], payload: MessageDispatch) => LLMMessage[];
