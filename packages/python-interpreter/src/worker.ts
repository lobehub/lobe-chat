import * as Comlink from 'comlink';
import { PyodideAPI, loadPyodide as loadPyodideType } from 'pyodide';
import urlJoin from 'url-join';

import { PythonOptions, PythonOutput, PythonResult } from './types';

declare global {
  // eslint-disable-next-line no-var
  var loadPyodide: typeof loadPyodideType;
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

// Pyodide 对象不能在 Worker 之间传递，因此定义为全局变量
let pyodide: PyodideAPI | undefined;

class PythonWorker {
  pyodideIndexUrl: string;
  pypiIndexUrl: string;

  constructor(options: PythonOptions) {
    this.pypiIndexUrl = options.pypiIndexUrl || 'PYPI';
    this.pyodideIndexUrl =
      options.pyodideIndexUrl || 'https://cdn.jsdelivr.net/pyodide/v0.28.2/full';
    globalThis.importScripts(urlJoin(this.pyodideIndexUrl, 'pyodide.js'));
  }

  get pyodide() {
    if (!pyodide) {
      throw new Error('Python interpreter not initialized');
    }
    return pyodide;
  }

  /**
   * 初始化 Python 解释器
   */
  async init() {
    pyodide = await globalThis.loadPyodide({
      indexURL: this.pyodideIndexUrl,
    });
    pyodide.FS.mkdirTree('/mnt/data');
    pyodide.FS.chdir('/mnt/data');
  }

  /**
   * 上传文件到解释器环境中
   * @param files 文件列表
   * @param path 保存目录，默认为 `/mnt/data/`
   */
  async uploadFiles(files: File[], path?: string) {
    const filePath = path || `/mnt/data/`;
    for (const file of files) {
      const content = new Uint8Array(await file.arrayBuffer());
      this.pyodide.FS.writeFile(`${filePath}/${file.name}`, content);
    }
  }

  /**
   * 从解释器环境中下载文件
   * @param files 文件列表
   */
  downloadFiles(files: string[]) {
    const result: File[] = [];
    for (const file of files) {
      // pyodide 的 FS 类型定义有问题，只能采用 any
      const content = (this.pyodide.FS as any).readFile(file, { encoding: 'binary' });
      const blob = new Blob([content]);
      result.push(new File([blob], file));
    }
    return result;
  }

  /**
   * 安装 Python 包
   * @param packages 包名列表
   */
  async installPackages(packages: string[]) {
    await this.pyodide.loadPackage('micropip');
    const micropip = this.pyodide.pyimport('micropip');
    micropip.set_index_urls([this.pypiIndexUrl, 'PYPI']);
    await micropip.install(packages);
  }

  /**
   * 读取目录中的文件列表
   * @param path 目录路径
   */
  readDir(path: string) {
    return this.pyodide.FS.readdir(path)
      .filter((file) => file !== '.' && file !== '..')
      .map((file) => `${path}/${file}`);
  }

  /**
   * 执行 Python 代码
   * @param code 代码
   */
  async runPython(code: string): Promise<PythonResult> {
    // NOTE: loadPackagesFromImports 只会处理 pyodide 官方包
    await this.pyodide.loadPackagesFromImports(code);
    await this.patchPackages();
    await this.patchFonts();

    // 安装依赖后再捕获标准输出，避免记录安装日志
    const output: PythonOutput[] = [];
    this.pyodide.setStdout({
      batched: (o: string) => {
        output.push({ data: o, type: 'stdout' });
      },
    });
    this.pyodide.setStderr({
      batched: (o: string) => {
        output.push({ data: o, type: 'stderr' });
      },
    });

    // 执行代码
    let result;
    let success = false;
    try {
      result = await this.pyodide.runPythonAsync(code);
      success = true;
    } catch (error) {
      output.push({
        data: error instanceof Error ? error.message : String(error),
        type: 'stderr',
      });
    }

    return {
      output,
      result: result?.toString(),
      success,
    };
  }

  private async patchPackages() {
    const hasMatplotlib = Object.keys(this.pyodide.loadedPackages).includes('matplotlib');
    if (hasMatplotlib) {
      await this.pyodide.runPythonAsync(PATCH_MATPLOTLIB);
    }
  }

  private async patchFonts() {
    this.pyodide.FS.mkdirTree('/fonts');
    const fontFiles = {
      'STSong.ttf':
        'https://cdn.jsdelivr.net/gh/Haixing-Hu/latex-chinese-fonts@latest/chinese/宋体/STSong.ttf',
    };
    for (const [filename, url] of Object.entries(fontFiles)) {
      const buffer = await fetch(url, { cache: 'force-cache' }).then((res) => res.arrayBuffer());
      this.pyodide.FS.writeFile(`/fonts/${filename}`, new Uint8Array(buffer));
    }
  }
}

Comlink.expose(PythonWorker);

export type PythonWorkerType = typeof PythonWorker;
