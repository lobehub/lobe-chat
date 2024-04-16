import { ImageProps } from 'antd';
import { ReactNode } from 'react';
export type PreviewOptions = any & {
    toolbarAddon?: ReactNode;
};
export declare const usePreview: ({ onVisibleChange, styles: previewStyle, minScale, maxScale, toolbarAddon, ...rest }?: PreviewOptions) => ImageProps['preview'];
export default usePreview;
