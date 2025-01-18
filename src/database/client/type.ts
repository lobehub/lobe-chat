export interface InitMeta {
  dbName: string;
  fsBundle: Blob;
  vectorBundlePath: string;
  wasmModule: WebAssembly.Module;
}
