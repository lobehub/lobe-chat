/**
 * 存储应用中需要用装饰器的类
 */
export class IoCContainer {
  static controllers: WeakMap<any, { methodName: string; name: string; showLog?: boolean }[]> =
    new WeakMap();

  init() {}
}
