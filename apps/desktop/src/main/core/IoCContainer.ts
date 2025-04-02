/**
 * 存储插件中的 service
 */
export class IoCContainer {
  static controllers: WeakMap<any, { methodName: string; name: string; showLog?: boolean }[]> =
    new WeakMap();

  init() {}
}
