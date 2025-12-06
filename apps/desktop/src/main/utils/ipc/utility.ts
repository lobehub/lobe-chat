import type { IpcContext } from './base'

// Extract method signatures from service class, removing context parameter
type PayloadResult<T> = T extends (...args: any[]) => any
  ? Parameters<T> extends []
    ? { optional: true; payload: undefined }
    : Parameters<T> extends [infer Only]
    ? Only extends IpcContext
      ? { optional: true; payload: undefined }
      : { optional: undefined extends Only ? true : false; payload: Only }
    : Parameters<T> extends [infer First, infer Second]
    ? Second extends IpcContext | undefined
      ? { optional: undefined extends First ? true : false; payload: First }
      : never
    : never
  : never

export type ExtractServiceMethods<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any
    ? K
    : never]: T[K] extends (...args: any[]) => infer Output
    ? PayloadResult<T[K]> extends { optional: infer Optional; payload: infer Payload }
      ? Optional extends true
        ? Payload extends undefined
          ? () => AlwaysPromise<Output>
          : (payload?: Payload) => AlwaysPromise<Output>
        : Payload extends undefined
        ? () => AlwaysPromise<Output>
        : (payload: Payload) => AlwaysPromise<Output>
      : never
    : never
}

type AlwaysPromise<T> = Promise<Awaited<T>>

// TypeScript utility type to automatically merge IPC services
// This version works with both the old object format and new createServices format
export type MergeIpcService<T> = {
  [K in keyof T]: T[K] extends new (...args: any[]) => infer Instance
    ? ExtractServiceMethods<Instance>
    : T[K] extends infer Instance
    ? ExtractServiceMethods<Instance>
    : never
}
