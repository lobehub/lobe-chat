# 数据存储取数模块

selectors 是 LobeChat 数据流研发框架下的取数模块，它的作用是从 store 中以特定特务逻辑取出数据，供组件消费使用。

以 `src/store/plugin/selectors.ts` 为例：

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

selectors 是高度模块化和可维护的，它通过将复杂的状态选择逻辑封装在单独的函数中，使得在应用程序的其他部分调用状态数据时，代码更加简洁和直观。此外，由于使用了 TypeScript，每个函数都可以具有明确的输入和输出类型，这有助于提高代码的可靠性和开发效率。

以 `displayPluginList` 方法为例。其代码如下：

```ts
const pluginList = (s: PluginStoreState) => [...s.pluginList, ...s.customPluginList];

const displayPluginList = (s: PluginStoreState) =>
  pluginList(s).map((p) => ({
    author: p.author,
    avatar: p.meta?.avatar,
    createAt: p.createAt,
    desc: pluginHelpers.getPluginDesc(p.meta),
    homepage: p.homepage,
    identifier: p.identifier,
    title: pluginHelpers.getPluginTitle(p.meta),
  }));
```

- `pluginList` 方法：用于从插件状态存储 PluginStoreState 中获取所有插件的列表。 它通过结合两个数组：pluginList 和 customPluginList 来创建一个新的插件列表；
- `displayPluginList` 方法：调用 pluginList 方法来获取合并后的插件列表，转换其中的 title 和 desc 变成显示在 UI 上的文本。

在组件中，只需引入便可直接获取最终消费的数据：

```tsx | pure
import { usePluginStore } from '@/store/plugin';
import { pluginSelectors } from '@/store/plugin/selectors';

const Render = ({ plugins }) => {
  const list = usePluginStore(pluginSelectors.displayPluginList);

  return <> ... </>;
};
```

这样实现的好处在于：

1. **解耦和重用**：通过将选择器独立于组件，我们可以在多个组件之间复用这些选择器而不需要重写取数逻辑。这减少了重复代码，提高了开发效率，并且使得代码库更加干净和易于维护。
2. **性能优化**：选择器可以用来计算派生数据，这样可以避免在每个组件中重复计算相同的数据。当状态发生变化时，只有依赖于这部分状态的选择器才会重新计算，从而减少不必要的渲染和计算。
3. **易于测试**：选择器是纯函数，它们仅依赖于传入的参数。这意味着它们可以在隔离的环境中进行测试，无需模拟整个 store 或组件树。
4. **类型安全**：由于 LobeChat 使用 TypeScript，每个选择器都有明确的输入和输出类型定义。这为开发者提供了自动完成和编译时检查的优势，减少了运行时错误。
5. **可维护性**：选择器集中了状态的读取逻辑，使得跟踪状态的变化和管理更加直观。如果状态结构发生变化，我们只需要更新相应的选择器，而不是搜索和替换整个代码库中的多个位置。
6. **可组合性**：选择器可以组合其他选择器，以创建更复杂的选择逻辑。这种模式允许开发者构建一个选择器层次结构，使得状态选择更加灵活和强大。
7. **简化组件逻辑**：组件不需要知道状态的结构或如何获取和计算需要的数据。组件只需调用选择器即可获取渲染所需的数据，这使得组件逻辑变得更简单和清晰。

通过这样的设计，LobeChat 的开发者可以更专注于构建用户界面和业务逻辑，而不必担心数据的获取和处理细节。这种模式也为未来可能的状态结构变更提供了更好的适应性和扩展性。
