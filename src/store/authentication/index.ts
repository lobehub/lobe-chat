import { StateCreator } from "zustand/vanilla";
import { createWithEqualityFn } from "zustand/traditional";
import { devtools, persist, PersistOptions } from "zustand/middleware";
import { isDev } from "@/utils/env";
import { shallow } from "zustand/shallow";
import { createHyperStorage } from "@/store/middleware/createHyperStorage";

const persistName = "AILoveWorld_Authentication";

export interface AuthenticationStore {
  setToken: (token: string) => void;
  token: string;
}

const persistOptions: PersistOptions<AuthenticationStore> = {
  name: persistName,

  // 手动控制 Hydration ，避免 ssr 报错
  skipHydration: true,

  storage: createHyperStorage({
    localStorage: {
      mode: "localStorage",
      dbName: persistName,
      selectors: ["token"],
    },
  }),
  version: 0,
};

const createStore: StateCreator<AuthenticationStore> = (setState) => ({
  token: "",
  setToken: (token) => {
    setState({ token });
  },
});
export const useAuthenticationStore =
  createWithEqualityFn<AuthenticationStore>()(
    persist(
      devtools(createStore, {
        name: persistName + (isDev ? "_DEV" : ""),
      }),
      persistOptions,
    ),
    shallow,
  );
