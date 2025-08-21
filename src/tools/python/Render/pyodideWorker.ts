import { PyodideAPI, type loadPyodide } from 'pyodide';

import { pythonEnv } from '@/config/python';

declare global {
  // eslint-disable-next-line no-var
  var images: Uint8Array[];
}

export interface PythonExecutionResult {
  error?: string;
  files?: PythonFileItem[];
  output?: Output[];
  result?: string;
  success: boolean;
}

export interface PythonFileItem {
  data?: Uint8Array;
  fileId?: string;
  filename: string;
}

interface Output {
  type: 'stdout' | 'stderr';
  value: string;
}

const PATCH_MATPLOTLIB = `
def patch_matplotlib():
  import matplotlib
  import matplotlib.pyplot as plt

  matplotlib.use('Agg')

  index = 1

  def show():
    nonlocal index
    plt.savefig(f'/mnt/data/plot_{index}.png', format="png")
    plt.clf()
    index += 1

  plt.show = show

patch_matplotlib()`;

async function initializePyodide(): Promise<PyodideAPI> {
  const indexURL =
    pythonEnv.NEXT_PUBLIC_PYODIDE_INDEX_URL || 'https://cdn.jsdelivr.net/pyodide/v0.28.2/full';
  globalThis.importScripts(`${indexURL}/pyodide.js`);
  return await ((globalThis as any).loadPyodide as typeof loadPyodide)({
    indexURL,
  });
}

export async function executePythonCode(
  code: string,
  packages?: string[],
): Promise<PythonExecutionResult> {
  try {
    const pyodide = await initializePyodide();

    // 加载代码中需要的包
    const loadedPackages = [];
    if (packages?.length) {
      await pyodide.loadPackage('micropip');
      const micropip = pyodide.pyimport('micropip');
      micropip.set_index_urls([pythonEnv.NEXT_PUBLIC_PYODIDE_PIP_INDEX_URL || 'PYPI', 'PYPI']);
      await micropip.install(packages);
      loadedPackages.push(...packages);
    } else {
      const p = await pyodide.loadPackagesFromImports(code);
      loadedPackages.push(...p.map((p) => p.name));
    }

    if (loadedPackages.includes('matplotlib')) {
      await pyodide.runPythonAsync(PATCH_MATPLOTLIB);
    }

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
    pyodide.FS.mkdirTree('/mnt/data');
    pyodide.FS.chdir('/mnt/data');

    // 执行 Python 代码
    try {
      const result = await pyodide.runPythonAsync(code);

      const files: PythonFileItem[] = [];
      pyodide.FS.readdir('/mnt/data').forEach((file) => {
        if (['.', '..'].includes(file)) {
          return;
        }
        // pyodide.FS 的类型定义不完整
        const fs = pyodide.FS as any;
        const buffer = fs.readFile(`/mnt/data/${file}`, { encoding: 'binary' });

        files.push({
          data: buffer,
          filename: file,
        });
      });

      return {
        files,
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
      success: false,
    };
  }
}

// WebWorker 消息监听
self.addEventListener('message', async (event) => {
  const { id, code, packages } = event.data;
  const result = await executePythonCode(code, packages);
  self.postMessage({ id, result });
});
