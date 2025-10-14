import { spawn } from 'node:child_process';

// Run tsc and filter out ../../packages errors while preserving colors
const tsc = spawn('tsgo', ['--noEmit', '--pretty'], {
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

let hasLocalErrors = false;
let errorCount = 0;
const errorFiles = new Set<string>();
let inFilteredError = false;
let inSummarySection = false;

const processLine = (line: string) => {
  // Strip ANSI color codes for easier pattern matching
  // eslint-disable-next-line no-control-regex
  const cleanLine = line.replaceAll(/\u001B\[\d+m/g, '');

  // Check if we've entered the summary section
  if (/^Errors\s+Files/.test(cleanLine)) {
    inFilteredError = false;
    inSummarySection = true;
    // Only show "Errors  Files" header if we have local errors
    if (hasLocalErrors) {
      console.log(line);
    }
    return;
  }

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
    if (cleanLine.trim() === '') {
      // On empty line, check if next line will be the end of filtered block
      // For now, just stay in filtered mode
      return;
    }
    // Otherwise, skip this line (it's part of the filtered error)
    return;
  }

  // Skip the original "Found X errors" line, we'll print our own
  if (/^Found \d+ errors? in \d+ files?\.$/.test(cleanLine)) {
    inSummarySection = false;
    return;
  }

  // In summary section, filter out lines with ../../
  if (inSummarySection) {
    // If we have no local errors, skip all summary lines
    if (!hasLocalErrors) {
      return;
    }
    // Skip lines containing ../../
    if (cleanLine.includes('../../')) {
      return;
    }
    // Also skip lines that look like summary stats (e.g., "     1  " without a local file path)
    // These are orphaned stats from filtered errors
    if (/^\s+\d+\s+$/.test(cleanLine)) {
      return;
    }
    // Keep printing other lines in summary section
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
