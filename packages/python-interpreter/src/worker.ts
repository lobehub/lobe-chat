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
  from matplotlib import font_manager

  # patch plt.show
  matplotlib.use('Agg')
  index = 1
  def show():
    nonlocal index
    plt.savefig(f'/mnt/data/plot_{index}.png', format="png")
    plt.clf()
    index += 1
  plt.show = show

  # patch fonts
  font_path = '/usr/share/fonts/truetype/STSong.ttf'
  font_manager.fontManager.addfont(font_path)
  plt.rcParams['font.family'] = 'STSong'

patch_matplotlib()`;

// Pyodide 对象不能在 Worker 之间传递，因此定义为全局变量
let pyodide: PyodideAPI | undefined;

class PythonWorker {
  pyodideIndexUrl: string;
  pypiIndexUrl: string;
  uploadedFiles: File[];

  constructor(options: PythonOptions) {
    this.pypiIndexUrl = options.pypiIndexUrl || 'PYPI';
    this.pyodideIndexUrl =
      options.pyodideIndexUrl || 'https://cdn.jsdelivr.net/pyodide/v0.28.2/full';
    globalThis.importScripts(urlJoin(this.pyodideIndexUrl, 'pyodide.js'));
    this.uploadedFiles = [];
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
   */
  async uploadFiles(files: File[]) {
    for (const file of files) {
      const content = new Uint8Array(await file.arrayBuffer());
      // TODO: 此处可以考虑使用 WORKERFS 减少一次拷贝
      if (file.name.startsWith('/')) {
        this.pyodide.FS.writeFile(file.name, content);
      } else {
        this.pyodide.FS.writeFile(`/mnt/data/${file.name}`, content);
      }
      this.uploadedFiles.push(file);
    }
  }

  /**
   * 从解释器环境中下载变动的文件
   * @param files 文件列表
   */
  async downloadFiles() {
    const result: File[] = [];
    for (const entry of this.pyodide.FS.readdir('/mnt/data')) {
      if (entry === '.' || entry === '..') continue;
      const filePath = `/mnt/data/${entry}`;
      // pyodide 的 FS 类型定义有问题，只能采用 any
      const content = (this.pyodide.FS as any).readFile(filePath, { encoding: 'binary' });
      const blob = new Blob([content]);
      const file = new File([blob], filePath);
      if (await this.isNewFile(file)) {
        result.push(file);
      }
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
   * 执行 Python 代码
   * @param code 代码
   */
  async runPython(code: string): Promise<PythonResult> {
    await this.patchFonts();
    // NOTE: loadPackagesFromImports 只会处理 pyodide 官方包
    await this.pyodide.loadPackagesFromImports(code);
    await this.patchPackages();

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
    this.pyodide.FS.mkdirTree('/usr/share/fonts/truetype');
    const fontFiles = {
      'STSong.ttf':
        'https://cdn.jsdelivr.net/gh/Haixing-Hu/latex-chinese-fonts@latest/chinese/宋体/STSong.ttf',
    };
    for (const [filename, url] of Object.entries(fontFiles)) {
      const buffer = await fetch(url, { cache: 'force-cache' }).then((res) => res.arrayBuffer());
      // NOTE: 此处理论上使用 createLazyFile 更好，但 pyodide 中使用会导致报错
      this.pyodide.FS.writeFile(`/usr/share/fonts/truetype/${filename}`, new Uint8Array(buffer));
    }
  }

  private async isNewFile(file: File) {
    const isSameFile = async (a: File, b: File) => {
      // a 是传入的文件，可能使用了绝对路径或相对路径
      // b 是解释器环境中的文件，使用绝对路径
      if (a.name.startsWith('/')) {
        if (a.name !== b.name) return false;
      } else {
        if (`/mnt/data/${a.name}` !== b.name) return false;
      }

      if (a.size !== b.size) return false;

      const aBuffer = await a.arrayBuffer();
      const bBuffer = await b.arrayBuffer();
      const aArray = new Uint8Array(aBuffer);
      const bArray = new Uint8Array(bBuffer);
      const length = aArray.length;
      for (let i = 0; i < length; i++) {
        if (aArray[i] !== bArray[i]) return false;
      }

      return true;
    };
    const t = await Promise.all(this.uploadedFiles.map((f) => isSameFile(f, file)));
    return t.every((f) => !f);
  }
}

Comlink.expose(PythonWorker);

export { PythonWorker };
export type PythonWorkerType = typeof PythonWorker;
