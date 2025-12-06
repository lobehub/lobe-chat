export type DispatchInvoke = <T = unknown>(event: string, ...data: any[]) => Promise<T>;
