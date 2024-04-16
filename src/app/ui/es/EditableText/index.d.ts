/// <reference types="react" />
import { ControlInputProps } from "../components/ControlInput";
export interface EditableTextProps extends ControlInputProps {
    editing?: boolean;
    onEditingChange?: (editing: boolean) => void;
    showEditIcon?: boolean;
}
declare const EditableText: import("react").NamedExoticComponent<EditableTextProps>;
export default EditableText;
