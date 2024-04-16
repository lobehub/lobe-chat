/// <reference types="react" />
export interface EmojiPickerProps {
    backgroundColor?: string;
    defaultAvatar?: string;
    locale?: string;
    onChange?: (emoji: string) => void;
    value?: string;
}
declare const EmojiPicker: import("react").NamedExoticComponent<EmojiPickerProps>;
export default EmojiPicker;
