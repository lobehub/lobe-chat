import { StateCreator } from "zustand/vanilla";
import { createWithEqualityFn } from "zustand/traditional";
import {
  devtools,
  persist,
  PersistOptions,
  PersistStorage,
} from "zustand/middleware";
import { isDev } from "@/utils/env";
import { shallow } from "zustand/shallow";
import { StorageValue } from "zustand/middleware/persist";
import { createHyperStorage } from "@/store/middleware/createHyperStorage";

const persistName = "Test";

export interface TestStore {
  setToken: (token: string) => void;
  token?: string;
}

const hs = createHyperStorage({
  localStorage: {
    mode: "localStorage",
    dbName: persistName,
    selectors: ["token"],
  },
}) as PersistStorage<TestStore>;
const ls = {
  getItem(
    name: string,
  ): StorageValue<TestStore> | Promise<StorageValue<TestStore> | null> | null {
    alert(1111);
    const str = localStorage.getItem(persistName) ?? "{}";
    return JSON.parse(str) as StorageValue<TestStore>;
  },
  setItem(name: string, value: StorageValue<TestStore>): void | Promise<void> {
    return undefined;
  },
  removeItem(name: string): void | Promise<void> {
    return undefined;
  },
};
const persistOptions: PersistOptions<TestStore> = {
  name: persistName,

  // 手动控制 Hydration ，避免 ssr 报错
  // skipHydration: true,

  storage: hs,
  version: 0,
};

const createStore: StateCreator<TestStore> = (setState) => ({
  token: undefined,
  setToken: (token) => {
    setState({ token });
  },
});
export const useTestStore = createWithEqualityFn<TestStore>()(
  persist(
    devtools(createStore, {
      name: persistName + (isDev ? "_DEV" : ""),
    }),
    persistOptions,
  ),
  shallow,
);
