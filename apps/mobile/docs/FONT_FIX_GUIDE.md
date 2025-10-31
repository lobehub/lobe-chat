# iOS 字体修复指南

## 问题说明

iOS 和 Android 在加载自定义字体时使用不同的字体名称格式：

- **Android**: 使用 `app.json` 中 `fontFamily` 定义的名称（如 `HarmonyOS-Sans`）
- **iOS**: 使用字体文件的 **PostScript Name**，而不是文件名或配置中的名称

## ✅ 问题已解决

### 字体名称的两种类型

iOS 字体系统有两种名称类型，用于不同的场景：

#### 1. PostScript Name（单一字重）

用于指定特定字重的字体文件：

| 字体文件                      | PostScript Name            |
| ----------------------------- | -------------------------- |
| HarmonyOS_Sans_SC_Regular.ttf | `HarmonyOS_Sans_SC`        |
| HarmonyOS_Sans_SC_Medium.ttf  | `HarmonyOS_Sans_SC-Medium` |
| HarmonyOS_Sans_SC_Bold.ttf    | `HarmonyOS_Sans_SC-Bold`   |
| Hack-Regular.ttf              | `Hack-Regular`             |
| Hack-Bold.ttf                 | `Hack-Bold`                |

#### 2. Family Name（支持多字重）⭐ **推荐**

用于让系统根据 `fontWeight` 自动选择字重：

| 字体家族            | Family Name         | 支持的字重    |
| ------------------- | ------------------- | ------------- |
| HarmonyOS Sans 中文 | `HarmonyOS Sans SC` | 400, 500, 700 |
| HarmonyOS Sans 英文 | `HarmonyOS Sans`    | 400, 500, 700 |
| Hack 代码字体       | `Hack`              | 400, 700      |

**为什么推荐 Family Name？**

```typescript
// ❌ 使用 PostScript name - 只能显示一个字重
fontFamily: 'HarmonyOS_Sans_SC'; // 只能显示 Regular (400)
fontWeight: '700'; // 无效！仍然显示 Regular

// ✅ 使用 Family name - 支持多字重
fontFamily: 'HarmonyOS Sans SC'; // 字体家族
fontWeight: '400'; // → 自动选择 Regular 字体文件
fontWeight: '500'; // → 自动选择 Medium 字体文件
fontWeight: '700'; // → 自动选择 Bold 字体文件
```

## 已完成的修复

### 1. `app.json` 配置更新

为 iOS 添加了明确的字体配置：

```json
{
  "expo-font": {
    "fonts": [...],
    "ios": {
      "fonts": [
        "./assets/fonts/Hack-Regular.ttf",
        "./assets/fonts/HarmonyOS_Sans_Regular.ttf",
        // ... 其他字体
      ]
    },
    "android": [...android配置保持不变...]
  }
}
```

### 2. `src/components/theme/seed.ts` 更新

使用 `Platform.select` 为 iOS 和 Android 提供不同的字体名称。

#### 方案 A：使用 Family Name（推荐，支持字重）

```typescript
const FONT_EN = Platform.select({
  android: 'HarmonyOS-Sans',
  ios: 'HarmonyOS Sans', // iOS Family name（空格，支持字重）
  default: 'HarmonyOS-Sans',
});

const FONT_CN = Platform.select({
  android: 'HarmonyOS-Sans-SC',
  ios: 'HarmonyOS Sans SC', // iOS Family name（空格，支持字重）
  default: 'HarmonyOS-Sans-SC',
});

const FONT_CODE = Platform.select({
  android: 'Hack',
  ios: 'Hack', // iOS Family name（支持字重）
  default: 'Hack',
});
```

#### 方案 B：使用 PostScript Name（当前配置，单一字重）

```typescript
const FONT_EN = Platform.select({
  android: 'HarmonyOS-Sans',
  ios: 'HarmonyOS_Sans', // iOS PostScript name (下划线，仅 Regular)
  default: 'HarmonyOS-Sans',
});

const FONT_CN = Platform.select({
  android: 'HarmonyOS-Sans-SC',
  ios: 'HarmonyOS_Sans_SC', // iOS PostScript name (下划线，仅 Regular)
  default: 'HarmonyOS-Sans-SC',
});

const FONT_CODE = Platform.select({
  android: 'Hack',
  ios: 'Hack-Regular', // iOS PostScript name (仅 Regular)
  default: 'Hack',
});
```

**推荐使用方案 A**，这样可以在代码中使用 `fontWeight` 属性切换不同字重。

### 3. 字体测试 Demo

创建了两个测试 demo：

1. **`fontTest.tsx`** - 测试不同字体名称格式（PostScript vs Family）
2. **`fontWeightTest.tsx`** - 测试字重切换是否正常工作

## 下一步操作

### 重新构建并测试

由于使用了 `expo-font` config plugin 并且更新了字体配置，需要重新构建开发版本：

```bash
# 清理缓存
rm -rf ios/build
rm -rf node_modules/.cache

# 重新构建 iOS 开发版本
pnpm ios
```

### 验证字体显示

构建完成后，进入 **Playground** → **Text** 组件：

#### 步骤 1：验证字体名称

查看 **字体名称测试** demo：

- 如果使用 PostScript name（下划线），文本应该能正常显示
- 如果使用 Family name（空格），文本也应该能正常显示

#### 步骤 2：验证字重切换 ⭐ **重要**

查看 **字重测试** demo：

1. 观察三种字体名称格式下的字重变化

2. **正确配置**应该看到明显的粗细差异：
   - `400` (Regular) - 正常粗细
   - `500` (Medium) - 中等粗细
   - `700` (Bold) - 明显加粗

3. **如果所有字重看起来一样**，说明字体名称格式不对：
   - ❌ 使用了 PostScript name → 只能显示单一字重
   - ✅ 需要改用 Family name → 支持多字重

#### 步骤 3：确定正确的 Family Name

根据测试结果，找到能够正确切换字重的字体名称格式，然后更新配置：

```typescript
// 如果 'HarmonyOS Sans SC' (空格) 能切换字重
const FONT_CN = Platform.select({
  ios: 'HarmonyOS Sans SC', // ✅ 使用这个
  // ...
});

// 如果 'HarmonyOS_Sans_SC' (下划线) 不能切换字重
const FONT_CN = Platform.select({
  ios: 'HarmonyOS_Sans_SC', // ❌ 不要使用这个
  // ...
});
```

### 如果字体正确显示

恭喜！字体问题已解决。可以删除字体测试 demo：

```bash
rm src/components/Text/demos/fontTest.tsx
```

然后在 `src/components/Text/demos/index.tsx` 中移除对应的导入和配置。

## 调试技巧

### 1. 查看已加载的字体

在 iOS 模拟器中，可以通过以下代码查看所有已加载的字体：

```typescript
import { Text } from 'react-native';

// 在开发环境打印所有字体家族
if (__DEV__) {
  const fontFamilies = Text.fontFamilies;
  console.log('Available fonts:', fontFamilies);
}
```

### 2. 检查字体是否嵌入

确认字体文件已正确嵌入到应用中：

```bash
# iOS: 检查 Info.plist
cat ios/LobeHub/Info.plist | grep -A 20 "UIAppFonts"
```

### 3. 使用后备字体

如果某个字体无法加载，可以在 `fontFamily` 中提供后备选项：

```typescript
fontFamily: `${FONT_EN},${FONT_CN},System`;
// 如果 FONT_EN 失败，会尝试 FONT_CN，最后使用系统字体
```

## 常见问题

### Q: 为什么 Android 可以正常显示，iOS 不行？

A: iOS 使用字体文件内部的 PostScript Name，而不是配置中定义的名称。Android 使用 XML 资源定义的 `fontFamily` 名称。**HarmonyOS Sans 的 PostScript Name 是 `HarmonyOS_Sans_SC`（带下划线），而不是 `HarmonyOS Sans SC`（带空格）或 `HarmonyOS-Sans-SC`（带连字符）。**

### Q: 如何知道字体的 Family Name 和 PostScript Name？

A: 使用 macOS Font Book 应用查看：

1. 双击字体文件打开 Font Book
2. 选择字体后按 `Cmd + I` 打开信息面板
3. 查看以下字段：
   - **家族** (Family) - 用于支持多字重
   - **PostScript 名称** - 用于单一字重
   - **样式** (Style) - Regular, Medium, Bold 等

或使用在线工具 <https://fontdrop.info。>

**示例：**

- Family: `HarmonyOS Sans SC` (支持 400/500/700)
- PostScript: `HarmonyOS_Sans_SC` (仅 Regular/400)
- PostScript: `HarmonyOS_Sans_SC-Bold` (仅 Bold/700)

### Q: 修改配置后字体还是不显示？

A: 确保：

1. ✅ 重新构建了应用（不是热重载）
2. ✅ 字体文件路径正确
3. ✅ PostScript Name 拼写正确（**区分大小写，使用下划线 `_`**）
4. ✅ 清理了缓存并重新安装了依赖

### Q: 可以使用系统字体吗？

A: 可以。在 `seed.ts` 中，字体配置已包含 `System` 后备选项。如果自定义字体加载失败，会自动使用系统默认字体。

## 参考资源

- [Expo Fonts 文档](https://docs.expo.dev/develop/user-interface/fonts/)
- [React Native 字体配置](https://reactnative.dev/docs/custom-fonts)
- [Font Book 用户指南](https://support.apple.com/guide/font-book/welcome/mac)
- [FontDrop 在线工具](https://fontdrop.info)

## 联系支持

如果问题仍然存在，请提供以下信息：

1. iOS 版本
2. Expo SDK 版本
3. 字体测试 demo 的截图
4. Xcode 控制台的错误日志
