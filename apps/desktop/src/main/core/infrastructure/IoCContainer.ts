/**
 * 存储应用中需要用装饰器的类
 */
export class IoCContainer {
  static controllers: WeakMap<
    any,
    { methodName: string; mode: 'client' | 'server'; name: string }[]
  > = new WeakMap();

  static shortcuts: WeakMap<any, { methodName: string; name: string }[]> = new WeakMap();

  static protocolHandlers: WeakMap<any, { action: string; methodName: string; urlType: string }[]> =
    new WeakMap();

  init() {}
}
