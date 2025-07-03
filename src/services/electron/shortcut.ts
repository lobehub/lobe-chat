import { dispatch } from '@lobechat/electron-client-ipc';

import { HotkeyEnum } from '@/types/hotkey';

/**
 * Web端键名到Electron键名的映射
 */
const KEY_MAPPING = new Map([
  // 修饰键
  ['mod', 'CommandOrControl'],
  ['ctrl', 'Ctrl'],
  ['alt', 'Alt'],
  ['shift', 'Shift'],
  ['meta', 'Cmd'],

  // 特殊键
  ['enter', 'Enter'],
  ['space', 'Space'],
  ['tab', 'Tab'],
  ['esc', 'Escape'],
  ['backspace', 'Backspace'],
  ['delete', 'Delete'],

  // 方向键
  ['up', 'Up'],
  ['down', 'Down'],
  ['left', 'Left'],
  ['right', 'Right'],

  // 功能键
  ['f1', 'F1'],
  ['f2', 'F2'],
  ['f3', 'F3'],
  ['f4', 'F4'],
  ['f5', 'F5'],
  ['f6', 'F6'],
  ['f7', 'F7'],
  ['f8', 'F8'],
  ['f9', 'F9'],
  ['f10', 'F10'],
  ['f11', 'F11'],
  ['f12', 'F12'],

  // 标点符号
  ['comma', ','],
  ['period', '.'],
  ['slash', '/'],
  ['backslash', '\\'],
  ['semicolon', ';'],
  ['quote', "'"],
  ['bracketleft', '['],
  ['bracketright', ']'],
  ['minus', '-'],
  ['equal', '='],
  ['backquote', '`'],
]);

/**
 * 创建反向映射（Electron键名到Web端键名）
 */
const REVERSE_KEY_MAPPING = new Map(
  Array.from(KEY_MAPPING.entries()).map(([web, electron]) => [electron, web]),
);

/**
 * Web端快捷键ID到桌面端快捷键ID的映射
 */
const ID_MAPPING = new Map<string, string>([
  [HotkeyEnum.ShowApp, 'toggleMainWindow'],
  [HotkeyEnum.OpenSettings, 'openSettingsWindow'],
]);

/**
 * 创建反向ID映射（桌面端ID到Web端ID）
 */
const REVERSE_ID_MAPPING = new Map(
  Array.from(ID_MAPPING.entries()).map(([web, desktop]) => [desktop, web]),
);

/**
 * 桌面端快捷键服务
 * 处理与桌面端快捷键配置的同步
 */
class ElectronShortcutService {
  /**
   * 获取桌面端快捷键配置
   */
  async getShortcutsConfig(): Promise<Record<string, string>> {
    const result = await dispatch('getShortcutsConfig');
    return result;
  }

  /**
   * 更新桌面端单个快捷键配置
   */
  async updateShortcutConfig(id: string, accelerator: string): Promise<boolean> {
    const result = await dispatch('updateShortcutConfig', id, accelerator);
    return result;
  }

  /**
   * 将Web端快捷键ID映射为桌面端快捷键ID
   */
  private mapWebToDesktopId(webId: string): string {
    return ID_MAPPING.get(webId) || webId;
  }

  /**
   * 将桌面端快捷键ID映射为Web端快捷键ID
   */
  private mapDesktopToWebId(desktopId: string): string {
    return REVERSE_ID_MAPPING.get(desktopId) || desktopId;
  }

  /**
   * 将Web端抽象键名转换为Electron具体键名
   * @param webKeys Web端键名格式 (如: mod+e, ctrl+shift+n)
   * @returns Electron键名格式 (如: CommandOrControl+E, Ctrl+Shift+N)
   */
  private convertWebKeysToElectron(webKeys: string): string {
    if (!webKeys) {
      console.log('[Web] Empty webKeys, returning as-is');
      return webKeys;
    }

    const result = webKeys
      .split('+')
      .map((key) => {
        const trimmedKey = key.trim().toLowerCase();

        // 先查找映射表
        if (KEY_MAPPING.has(trimmedKey)) {
          return KEY_MAPPING.get(trimmedKey)!;
        }

        // 普通字母和数字，转为大写
        if (/^[\da-z]$/.test(trimmedKey)) {
          return trimmedKey.toUpperCase();
        }

        // 其他情况保持原样
        return key.trim();
      })
      .join('+');

    return result;
  }

  /**
   * 将Electron键名转换为Web端抽象键名
   * @param electronKeys Electron键名格式 (如: CommandOrControl+E)
   * @returns Web端键名格式 (如: mod+e)
   */
  private convertElectronKeysToWeb(electronKeys: string): string {
    if (!electronKeys) return electronKeys;

    return electronKeys
      .split('+')
      .map((key) => {
        const trimmedKey = key.trim();

        // 先查找反向映射表
        if (REVERSE_KEY_MAPPING.has(trimmedKey)) {
          return REVERSE_KEY_MAPPING.get(trimmedKey)!;
        }

        // 普通字母和数字，转为小写
        if (/^[\dA-Z]$/.test(trimmedKey)) {
          return trimmedKey.toLowerCase();
        }

        // 其他情况转为小写
        return key.trim().toLowerCase();
      })
      .join('+');
  }

  /**
   * 获取映射后的快捷键配置（桌面端ID -> Web端ID，键名也转换）
   */
  async getMappedShortcutsConfig(): Promise<Record<string, string>> {
    const desktopConfig = await this.getShortcutsConfig();

    const mappedConfig: Record<string, string> = {};

    Object.entries(desktopConfig).forEach(([desktopId, electronKeys]) => {
      const webId = this.mapDesktopToWebId(desktopId);
      const webKeys = this.convertElectronKeysToWeb(electronKeys);

      mappedConfig[webId] = webKeys;
    });

    return mappedConfig;
  }

  /**
   * 更新映射后的快捷键配置（Web端ID -> 桌面端ID，键名也转换）
   */
  async updateMappedShortcutConfig(webId: string, webKeys: string): Promise<boolean> {
    const desktopId = this.mapWebToDesktopId(webId);
    const electronKeys = this.convertWebKeysToElectron(webKeys);

    const result = await this.updateShortcutConfig(desktopId, electronKeys);
    return result;
  }
}

export const electronShortcutService = new ElectronShortcutService();
