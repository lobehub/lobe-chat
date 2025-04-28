## Menu 实现框架

```
apps/desktop/src/main/
├── core/
│   ├── App.ts                // 应用核心类
│   ├── BrowserManager.ts     // 浏览器窗口管理
│   └── MenuManager.ts        // 新增：菜单管理核心类，负责选择和协调平台实现
├── menus/                    // 新增：菜单实现目录
│   ├── index.ts              // 导出平台实现和接口
│   ├── types.ts              // 定义菜单平台接口 IMenuPlatform
│   └── impl/                 // 平台特定实现目录
│       ├── BaseMenuPlatform.ts // 基础平台类，注入App
│       ├── DarwinMenu.ts       // macOS 充血模型实现
│       ├── WindowsMenu.ts      // Windows 充血模型实现
│       └── LinuxMenu.ts        // Linux 充血模型实现
├── controllers/
│   └── MenuCtr.ts            // 菜单控制器，处理渲染进程调用
```

## i18n

src/main/
├── core/
│ ├── I18nManager.ts //i18n 管理器
│ └── App.ts // 应用主类，集成 i18n
├── locales/
│ ├── index.ts // 导出 i18n 相关功能
│ ├── resources.ts // 资源加载逻辑
│ └── default/ // 默认中文翻译源文件
│ ├── index.ts // 导出所有翻译
│ ├── menu.ts // 菜单翻译
│ ├── dialog.ts // 对话框翻译
│ └── common.ts // 通用翻译

主进程 i18n 国际化管理
使用方式:

1. 直接导入 i18nManager 实例:
   import i18nManager from '@/locales';

2. 使用翻译函数:
   import {t} from '@/locales';
   const translated = t ('key');

3. 添加新翻译:
   在 locales/default/ 目录下添加翻译源文件
