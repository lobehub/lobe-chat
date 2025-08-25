import { PythonInterpreter } from '@lobechat/python-interpreter';

import { PythonResponse } from '@/types/tool/python';

class PythonService {
  async runPython(
    code: string,
    packages: string[],
    files: File[],
  ): Promise<PythonResponse | undefined> {
    if (typeof Worker === 'undefined') return;
    const interpreter = await new PythonInterpreter!({
      pyodideIndexUrl: process.env.NEXT_PUBLIC_PYODIDE_INDEX_URL!,
      pypiIndexUrl: process.env.NEXT_PUBLIC_PYPI_INDEX_URL!,
    });
    await interpreter.init();
    await interpreter.installPackages(packages.filter((p) => p !== ''));
    await interpreter.uploadFiles(files);

    const result = await interpreter.runPython(code);

    const resultFiles = await interpreter.downloadFiles();
    return {
      files: resultFiles.map((file) => ({
        data: file,
        filename: file.name,
        previewUrl: URL.createObjectURL(file),
      })),
      ...result,
    };
  }
}

export const pythonService = new PythonService();
