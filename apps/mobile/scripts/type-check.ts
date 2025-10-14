import { spawn } from 'node:child_process';

// Run tsc and filter out ../../packages errors while preserving colors
const tsc = spawn('tsc', ['--noEmit', '--pretty'], {
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

let hasLocalErrors = false;
let errorCount = 0;
const errorFiles = new Set<string>();
let inFilteredError = false;

const processLine = (line: string) => {
  // Strip ANSI color codes for easier pattern matching
  // eslint-disable-next-line no-control-regex
  const cleanLine = line.replaceAll(/\u001B\[\d+m/g, '');

  // Check if this is a file path error line (path:line:col - error)
  const isErrorLine = cleanLine.match(/^([^:]+):(\d+):(\d+) - error/);

  if (isErrorLine) {
    const filePath = isErrorLine[1];
    // Check if this error is from a parent directory
    if (filePath.includes('../../')) {
      inFilteredError = true;
      return;
    }
    // This is a local error
    inFilteredError = false;
    hasLocalErrors = true;
    errorCount++;
    errorFiles.add(filePath);
    console.log(line);
    return;
  }

  // If we're in a filtered error block, skip the line
  if (inFilteredError) {
    // Check if we've reached a new section
    // - Two consecutive empty lines
    // - "Errors  Files" summary section
    // - A new local file error (already handled above)
    if (cleanLine.trim() === '') {
      // On empty line, check if next line will be the end of filtered block
      // For now, just stay in filtered mode
      return;
    }
    if (/^Errors\s+Files/.test(cleanLine)) {
      inFilteredError = false;
      console.log(line);
      return;
    }
    // Otherwise, skip this line (it's part of the filtered error)
    return;
  }

  // Skip the original "Found X errors" line, we'll print our own
  if (/^Found \d+ errors? in \d+ files?\.$/.test(cleanLine)) {
    return;
  }

  // Filter out error summary lines containing ../../
  if (/^\d+\s+\.\.\/\.\./.test(cleanLine.trim())) {
    return;
  }

  console.log(line);
};

tsc.stdout?.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(processLine);
});

tsc.stderr?.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(processLine);
});

tsc.on('close', () => {
  // Print our own error summary
  if (hasLocalErrors) {
    const fileCount = errorFiles.size;
    const errorText = errorCount === 1 ? 'error' : 'errors';
    const fileText = fileCount === 1 ? 'file' : 'files';
    console.log(`\nFound ${errorCount} ${errorText} in ${fileCount} ${fileText}.`);
  }

  // Exit with error code only if there are local errors
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(hasLocalErrors ? 1 : 0);
});
