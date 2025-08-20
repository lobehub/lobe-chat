declare global {
  function loadPyodide(config: any): Promise<any>;
  function importScripts(url: string): void;
}

type PyodideInterface = any;

export interface PythonExecutionResult {
  error?: string;
  output: Output[];
  result?: string;
  success: boolean;
}

interface Output {
  type: 'stdout' | 'stderr';
  value: string;
}

const PATCH_MATPLOTLIB = `
def patch_matplotlib():
  import matplotlib
  import matplotlib.pyplot as plt
  from pyodide.ffi import to_js
  from js import postMessage, Object
  from io import BytesIO
  from base64 import b64encode

  matplotlib.use('Agg')

  def show():
    buf = BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)

    img_data = b64encode(buf.getvalue()).decode("utf-8")
    buf.close()

    postMessage(to_js({
      "type": "matplotlib-image",
      "payload": img_data
    }, dict_converter=Object.fromEntries))

    plt.clf()

  plt.show = show


patch_matplotlib()`;

let pyodideLoaded = false;

async function loadPyodideScript(): Promise<void> {
  if (pyodideLoaded) return;
  const script = 'https://cdn.jsdelivr.net/pyodide/v0.28.1/full/pyodide.js';
  (globalThis as any).importScripts(script);
  pyodideLoaded = true;
}

async function initializePyodide(): Promise<PyodideInterface> {
  await loadPyodideScript();
  return (globalThis as any).loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.1/full/',
  });
}

export async function executePythonCode(code: string): Promise<PythonExecutionResult> {
  try {
    const pyodide = await initializePyodide();

    // 捕获标准输出和错误输出
    const output: Output[] = [];
    pyodide.setStdout({
      batched: (o: string) => {
        output.push({ type: 'stdout', value: o });
      },
    });
    pyodide.setStderr({
      batched: (o: string) => {
        output.push({ type: 'stderr', value: o });
      },
    });

    // 加载代码中需要的包
    const packages = await pyodide.loadPackagesFromImports(code, {
      messageCallback: (message: string) => {
        console.log('Package loading:', message);
      },
    });
    packages.forEach(async (pkg: any) => {
      if (pkg.name === 'matplotlib') {
        await pyodide.runPythonAsync(PATCH_MATPLOTLIB);
      }
    });

    // 执行 Python 代码
    try {
      const result = await pyodide.runPythonAsync(code);
      return {
        output,
        result: result !== undefined ? String(result) : undefined,
        success: true,
      };
    } catch (error) {
      output.push({
        type: 'stderr',
        value: error instanceof Error ? error.message : String(error),
      });
      return {
        output,
        success: false,
      };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      output: [],
      success: false,
    };
  }
}

// WebWorker 消息监听
self.addEventListener('message', async (event) => {
  const { id, code } = event.data;
  const result = await executePythonCode(code);
  self.postMessage({ id, result });
});
