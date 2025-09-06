import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PythonWorker } from '../worker';

vi.mock('comlink', () => ({
  expose: vi.fn(),
}));

describe('PythonWorker', () => {
  const mockPyodide = {
    FS: {
      mkdirTree: vi.fn(),
      chdir: vi.fn(),
      writeFile: vi.fn(),
      readdir: vi.fn(),
      readFile: vi.fn(),
    },
    loadPackage: vi.fn(),
    pyimport: vi.fn(),
    loadPackagesFromImports: vi.fn(),
    setStdout: vi.fn(),
    setStderr: vi.fn(),
    runPythonAsync: vi.fn(),
    loadedPackages: {},
  };

  const mockMicropip = {
    set_index_urls: vi.fn(),
    install: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup minimal global mocks
    globalThis.importScripts = vi.fn();
    globalThis.loadPyodide = vi.fn().mockResolvedValue(mockPyodide);
    globalThis.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
    });

    // Reset global pyodide
    (global as any).pyodide = undefined;
    mockPyodide.pyimport.mockReturnValue(mockMicropip);
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const worker = new PythonWorker({});

      expect(worker.pypiIndexUrl).toBe('PYPI');
      expect(worker.pyodideIndexUrl).toBe('https://cdn.jsdelivr.net/pyodide/v0.28.2/full');
      expect(worker.uploadedFiles).toEqual([]);
    });

    it('should initialize with custom options', () => {
      const options = {
        pyodideIndexUrl: 'https://test.cdn.com/pyodide',
        pypiIndexUrl: 'https://test.pypi.org',
      };
      const worker = new PythonWorker(options);

      expect(worker.pypiIndexUrl).toBe('https://test.pypi.org');
      expect(worker.pyodideIndexUrl).toBe('https://test.cdn.com/pyodide');
    });
  });

  describe('pyodide getter', () => {
    it('should throw error when pyodide is not initialized', () => {
      const worker = new PythonWorker({});
      expect(() => worker.pyodide).toThrow('Python interpreter not initialized');
    });

    it('should return pyodide when initialized', async () => {
      const worker = new PythonWorker({});
      await worker.init();
      expect(worker.pyodide).toBe(mockPyodide);
    });
  });

  describe('init', () => {
    it('should initialize pyodide and setup filesystem', async () => {
      const worker = new PythonWorker({
        pyodideIndexUrl: 'https://test.cdn.com/pyodide',
      });

      await worker.init();

      expect(globalThis.loadPyodide).toHaveBeenCalledWith({
        indexURL: 'https://test.cdn.com/pyodide',
      });
      expect(mockPyodide.FS.mkdirTree).toHaveBeenCalledWith('/mnt/data');
      expect(mockPyodide.FS.chdir).toHaveBeenCalledWith('/mnt/data');
    });
  });

  describe('file operations', () => {
    let worker: PythonWorker;

    beforeEach(async () => {
      worker = new PythonWorker({});
      await worker.init();
    });

    it('should upload files correctly', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      await worker.uploadFiles([mockFile]);

      expect(mockPyodide.FS.writeFile).toHaveBeenCalledWith(
        '/mnt/data/test.txt',
        expect.any(Uint8Array),
      );
      expect(worker.uploadedFiles).toContain(mockFile);
    });

    it('should download new files from filesystem', async () => {
      const mockFileContent = new Uint8Array([1, 2, 3, 4]);

      mockPyodide.FS.readdir.mockReturnValue(['.', '..', 'output.txt']);
      (mockPyodide.FS as any).readFile.mockReturnValue(mockFileContent);

      const files = await worker.downloadFiles();

      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('/mnt/data/output.txt');
    });
  });

  describe('runPython', () => {
    let worker: PythonWorker;

    beforeEach(async () => {
      worker = new PythonWorker({});
      await worker.init();
    });

    it('should execute python code successfully', async () => {
      const code = 'print("Hello, World!")';
      const expectedResult = 'Hello, World!';

      mockPyodide.runPythonAsync.mockResolvedValue(expectedResult);

      const result = await worker.runPython(code);

      expect(result.success).toBe(true);
      expect(result.result).toBe(expectedResult);
      expect(mockPyodide.runPythonAsync).toHaveBeenCalledWith(code);
    });

    it('should handle python execution errors', async () => {
      const error = new Error('SyntaxError: invalid syntax');
      mockPyodide.runPythonAsync.mockRejectedValue(error);

      const result = await worker.runPython('invalid code');

      expect(result.success).toBe(false);
      expect(result.output).toContainEqual({
        data: 'SyntaxError: invalid syntax',
        type: 'stderr',
      });
    });

    it('should install packages using micropip', async () => {
      const packages = ['numpy', 'pandas'];

      await worker.installPackages(packages);

      expect(mockPyodide.loadPackage).toHaveBeenCalledWith('micropip');
      expect(mockMicropip.install).toHaveBeenCalledWith(packages);
    });
  });
});
