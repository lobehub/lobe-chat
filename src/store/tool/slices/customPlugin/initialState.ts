import { CustomPlugin } from '@/types/plugin';

export interface CustomPluginState {
  customPluginList: CustomPlugin[];
  newCustomPlugin: Partial<CustomPlugin>;
}
export const defaultCustomPlugin: Partial<CustomPlugin> = {
  apiMode: 'simple',
  enableSettings: false,
  manifestMode: 'url',
};

export const initialCustomPluginState: CustomPluginState = {
  customPluginList: [],
  newCustomPlugin: defaultCustomPlugin,
};
