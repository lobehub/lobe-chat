## Selector

以

这个 TypeScript 代码段定义了一个名为 `pluginSelectors` 的对象，该对象包含一系列用于从插件存储状态中检索数据的选择器函数。选择器是一种从 Redux store（或类似的状态管理库）中提取和派生数据的函数。这个特定的例子是为了管理与前端应用程序的插件系统相关的状态。

下面是一些关键点的说明：

- `enabledSchema`: 一个函数，返回一个基于启用插件列表 `enabledPlugins` 过滤后的 `ChatCompletionFunctions` 数组。它将插件标识符作为前缀添加到 API 名称，以确保唯一性，并使用 `uniqBy` 函数从 Lodash 库中删除重复项。
- `onlinePluginStore`: 返回当前在线插件列表。
- `pluginList`: 返回插件列表，包括自定义插件和标准插件。
- `getPluginMetaById`: 根据插件 ID 返回插件元数据。
- `getDevPluginById`: 返回开发中的自定义插件信息。
- `getPluginManifestById`: 根据插件 ID 返回插件清单。
- `getPluginSettingsById`: 根据插件 ID 返回插件设置。
- `getPluginManifestLoadingStatus`: 根据插件 ID 返回插件清单的加载状态（加载中、成功或错误）。
- `isCustomPlugin`: 检查给定 ID 的插件是否为自定义插件。
- `displayPluginList`: 返回一个处理过的插件列表，包括作者、头像、创建时间、描述、首页 URL、标识符和标题。
- `hasPluginUI`: 根据插件 ID 确定插件是否有 UI 组件。

这个代码块是高度模块化和可维护的，它通过将复杂的状态选择逻辑封装在单独的函数中，使得在应用程序的其他部分调用状态数据时，代码更加简洁和直观。此外，由于使用了 TypeScript，每个函数都可以具有明确的输入和输出类型，这有助于提高代码的可靠性和开发效率。

对于测试这样的选择器，您需要确保每个函数都能在给定不同的状态输入时返回正确的输出。这可能包括测试边缘情况，如空数组或未定义的输入，以及确保正确处理各种可能的状态组合。使用 Vitest 测试框架，您可以编写单元测试来模拟不同的状态，并验证每个选择器是否按预期工作。
