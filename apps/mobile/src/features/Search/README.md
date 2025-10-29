# Search Feature

搜索功能的共用组件和 Hooks。

## 组件

### RecentSearches

最近搜索历史展示组件。

#### Props

| 属性名                | 类型                      | 必填 | 说明               |
| --------------------- | ------------------------- | ---- | ------------------ |
| `searches`            | `string[]`                | ✅   | 搜索历史列表       |
| `onItemClick`         | `(query: string) => void` | ✅   | 点击搜索项的回调   |
| `onItemRemove`        | `(query: string) => void` | ✅   | 删除搜索项的回调   |
| `onClear`             | `() => void`              | ✅   | 清空搜索历史的回调 |
| `recentSearchesTitle` | `string`                  | ✅   | 最近搜索标题文本   |
| `emptyDescription`    | `string`                  | ✅   | 空状态提示文本     |

#### 使用示例

```tsx
import { RecentSearches } from '@/features/Search';

const MySearchPage = () => {
  const { t } = useTranslation('common');
  const { recentSearches, saveRecentSearch, removeRecentSearch, clearRecentSearches } =
    useRecentSearches('my_search_key');

  return (
    <RecentSearches
      searches={recentSearches}
      onItemClick={(query) => console.log('Clicked:', query)}
      onItemRemove={removeRecentSearch}
      onClear={clearRecentSearches}
      recentSearchesTitle={t('myFeature.recentSearches')}
      emptyDescription={t('myFeature.searchPlaceholder')}
    />
  );
};
```

## Hooks

### useRecentSearches

管理最近搜索历史的 Hook。

#### 参数

| 参数名       | 类型     | 必填 | 说明                                       |
| ------------ | -------- | ---- | ------------------------------------------ |
| `storageKey` | `string` | ✅   | 本地存储的键名，用于区分不同场景的搜索历史 |

#### 返回值

| 属性名                | 类型                      | 说明             |
| --------------------- | ------------------------- | ---------------- |
| `recentSearches`      | `string[]`                | 搜索历史列表     |
| `saveRecentSearch`    | `(query: string) => void` | 保存搜索记录     |
| `removeRecentSearch`  | `(query: string) => void` | 删除单个搜索记录 |
| `clearRecentSearches` | `() => void`              | 清空搜索记录     |

#### 使用示例

```tsx
import { useRecentSearches } from '@/features/Search';

const MySearchPage = () => {
  // 使用不同的 storageKey 来区分不同场景
  const { recentSearches, saveRecentSearch, removeRecentSearch, clearRecentSearches } =
    useRecentSearches('my_feature_recent_searches');

  const handleSearch = (query: string) => {
    // 保存搜索记录
    saveRecentSearch(query);
    // 执行搜索...
  };

  return (
    <div>
      <input onSubmit={(e) => handleSearch(e.target.value)} />
      <ul>
        {recentSearches.map((query) => (
          <li key={query} onClick={() => handleSearch(query)}>
            {query}
            <button onClick={() => removeRecentSearch(query)}>删除</button>
          </li>
        ))}
      </ul>
      <button onClick={clearRecentSearches}>清空历史</button>
    </div>
  );
};
```

## 当前使用场景

### 1. Assistant 搜索（Discover）

- **存储键**: `assistant_recent_searches`
- **位置**: `src/app/discover/assistant/search/index.tsx`
- **翻译命名空间**: `common`

### 2. Session 搜索

- **存储键**: `session_recent_searches`
- **位置**: `src/app/(main)/session/search/index.tsx`
- **翻译命名空间**: `chat`

## 特性

- ✅ 最多保存 10 条搜索历史
- ✅ 自动去重（新搜索会移到最前面）
- ✅ 持久化存储（使用 MMKV）
- ✅ 支持删除单条记录
- ✅ 支持清空全部记录
- ✅ 支持自定义翻译文本
- ✅ 统一的 UI 样式
