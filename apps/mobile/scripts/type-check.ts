import { spawn } from 'node:child_process';

// Run tsc and filter out ../../packages errors while preserving colors
const tsc = spawn('tsgo', ['--noEmit', '--pretty'], {
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

let hasLocalErrors = false;

const processLine = (line: string) => {
  // Filter out lines containing ../../packages
  if (line.includes('../../packages')) {
    return;
  }

  // Check if this is an error in our local files
  if (line.includes('error TS')) {
    hasLocalErrors = true;
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
  // Exit with error code only if there are local errors
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(hasLocalErrors ? 1 : 0);
});
