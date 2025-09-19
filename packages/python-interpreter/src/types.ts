export interface PythonOptions {
  /**
   * Pyodide CDN URL
   */
  pyodideIndexUrl?: string;
  /**
   * PyPI 索引 URL，要求支持 [JSON API](https://warehouse.pypa.io/api-reference/json.html)
   *
   * 默认值：`https://pypi.org/pypi/{package_name}/json`
   */
  pypiIndexUrl?: string;
}

export interface PythonOutput {
  data: string;
  type: 'stdout' | 'stderr';
}

export interface PythonResult {
  output?: PythonOutput[];
  result?: string;
  success: boolean;
}
