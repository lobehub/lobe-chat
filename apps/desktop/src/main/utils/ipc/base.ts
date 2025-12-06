import type { IpcMainInvokeEvent, WebContents } from 'electron';
import { ipcMain } from 'electron';

// Base context for IPC methods
export interface IpcContext {
  sender: WebContents;
  event: IpcMainInvokeEvent;
}

// Metadata storage for decorated methods
const methodMetadata = new WeakMap<any, Map<string, string>>();
const serverMethodMetadata = new WeakMap<any, Map<string, string>>();

// Decorator for IPC methods
export function IpcMethod(channelName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const { constructor } = target;

    if (!methodMetadata.has(constructor)) {
      methodMetadata.set(constructor, new Map());
    }

    const methods = methodMetadata.get(constructor)!;
    methods.set(propertyKey, channelName || propertyKey);

    return descriptor;
  };
}

export function IpcServerMethod(channelName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const { constructor } = target;

    if (!serverMethodMetadata.has(constructor)) {
      serverMethodMetadata.set(constructor, new Map());
    }

    const methods = serverMethodMetadata.get(constructor)!;
    methods.set(propertyKey, channelName || propertyKey);

    return descriptor;
  };
}

// Handler registry for IPC methods
export class IpcHandler {
  private static instance: IpcHandler;
  private registeredChannels = new Set<string>();

  static getInstance(): IpcHandler {
    if (!IpcHandler.instance) {
      IpcHandler.instance = new IpcHandler();
    }
    return IpcHandler.instance;
  }

  registerMethod<TInput, TOutput>(
    channel: string,
    handler: (payload: TInput, context?: IpcContext) => Promise<TOutput> | TOutput,
  ) {
    if (this.registeredChannels.has(channel)) {
      return; // Already registered
    }

    this.registeredChannels.add(channel);

    ipcMain.handle(channel, async (event: IpcMainInvokeEvent, ...args: any[]) => {
      const context: IpcContext = {
        sender: event.sender,
        event,
      };

      try {
        const payload = args.length > 0 ? (args[0] as TInput) : (undefined as TInput);
        return await handler(payload, context);
      } catch (error) {
        console.error(`Error in IPC method ${channel}:`, error);
        throw error;
      }
    });
  }

  // Send events to renderer
  sendToRenderer<T = any>(webContents: WebContents, channel: string, data: T) {
    webContents.send(channel, data);
  }
}

// Base class for IPC service groups
export abstract class IpcService {
  protected handler = IpcHandler.getInstance();
  static readonly groupName: string;

  constructor() {
    this.registerMethods();
  }

  protected registerMethods(): void {
    const { constructor } = this;
    const methods = methodMetadata.get(constructor);

    if (methods) {
      methods.forEach((methodName, propertyKey) => {
        const method = (this as any)[propertyKey];
        if (typeof method === 'function') {
          this.registerMethod(methodName, method.bind(this));
        }
      });
    }
  }

  protected registerMethod<TInput, TOutput>(
    methodName: string,
    handler: (payload: TInput, context?: IpcContext) => Promise<TOutput> | TOutput,
  ) {
    const groupName = (this.constructor as typeof IpcService).groupName;
    const channel = `${groupName}.${methodName}`;
    this.handler.registerMethod(channel, handler);
  }
}

// Service constructor with groupName
export interface IpcServiceConstructor {
  new (...args: any[]): IpcService;
  readonly groupName: string;
}

// Create services function that infers types from service constructors
export function createServices<T extends readonly IpcServiceConstructor[]>(
  serviceConstructors: T,
  ...constructorArgs: any[]
): CreateServicesResult<T> {
  const services = {} as any;

  for (const ServiceConstructor of serviceConstructors) {
    const instance = new ServiceConstructor(...constructorArgs);
    const groupName = ServiceConstructor.groupName;

    if (!groupName) {
      throw new Error(
        `Service ${ServiceConstructor.name} must define a static readonly groupName property`,
      );
    }

    services[groupName] = instance;
  }

  return services;
}

// Helper type for createServices return type
export type CreateServicesResult<T extends readonly IpcServiceConstructor[]> = {
  [K in T[number] as K['groupName']]: InstanceType<K>;
};

export function getServerMethodMetadata(target: IpcServiceConstructor) {
  return serverMethodMetadata.get(target);
}
