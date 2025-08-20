import { PyodideAPI, type loadPyodide } from 'pyodide';

declare global {
  // eslint-disable-next-line no-var
  var images: Uint8Array[];
}

export interface PythonImageItem {
  // 临时预览 URL (base64)
  filename: string;
  imageId?: string;
  // 持久化后的文件 ID
  previewUrl?: string; // 图片文件名
}

export interface PythonExecutionResult {
  error?: string;
  images?: PythonImageItem[]; // 新增图片数组
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
  from js import images
  from io import BytesIO
  from base64 import b64encode

  matplotlib.use('Agg')

  def show():
    buf = BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)

    images.append(to_js(buf.getvalue()))
    buf.close()

    plt.clf()

  plt.show = show

patch_matplotlib()`;

async function initializePyodide(): Promise<PyodideAPI> {
  const indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.28.2/full';
  globalThis.importScripts(`${indexURL}/pyodide.js`);
  return await ((globalThis as any).loadPyodide as typeof loadPyodide)({
    indexURL,
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

    // 捕获图片
    globalThis.images = [];

    // 加载代码中需要的包
    const packages = await pyodide.loadPackagesFromImports(code, {
      messageCallback: (message: string) => {
        console.log('Package loading:', message);
      },
    });
    packages.forEach(async (pkg) => {
      if (pkg.name === 'matplotlib') {
        await pyodide.runPythonAsync(PATCH_MATPLOTLIB);
      }
    });

    // 执行 Python 代码
    try {
      const result = await pyodide.runPythonAsync(code);

      // 处理捕获的图片
      const images: PythonImageItem[] = [];
      if (globalThis.images && globalThis.images.length > 0) {
        globalThis.images.forEach((imageData, index) => {
          // 将 Uint8Array 转换为 base64
          const uint8Array = new Uint8Array(imageData);
          const binaryString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join('');
          const base64 = btoa(binaryString);
          const dataUrl = `data:image/png;base64,${base64}`;

          images.push({
            filename: `plot_${index + 1}.png`,
            previewUrl: dataUrl,
          });
        });

        // 清空图片数组以备下次执行
        globalThis.images = [];
      }

      return {
        images: images.length > 0 ? images : undefined,
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
        images: undefined,
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
