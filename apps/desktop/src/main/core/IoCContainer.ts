/**
 * 存储应用中需要用装饰器的类
 */
export class IoCContainer {
  static controllers: WeakMap<
    any,
    { methodName: string; mode: 'client' | 'server'; name: string }[]
  > = new WeakMap();

  init() {}
}
