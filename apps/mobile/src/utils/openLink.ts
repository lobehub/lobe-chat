import * as WebBrowser from 'expo-web-browser';

/**
 * 在应用内使用内置浏览器打开链接
 * @param url - 要打开的链接地址
 * @param options - WebBrowser 的配置选项
 */
export const openLink = async (
  url: string,
  options?: {
    controlsColor?: string;
    presentationStyle?: WebBrowser.WebBrowserPresentationStyle;
  },
) => {
  try {
    await WebBrowser.openBrowserAsync(url, {
      controlsColor: options?.controlsColor,
      presentationStyle:
        options?.presentationStyle || WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  } catch (error) {
    console.error('Failed to open browser:', error);
  }
};
