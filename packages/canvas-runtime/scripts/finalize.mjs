import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, '../dist');
const jsFile = path.join(dist, 'canvas-runtime.js');
const cssFiles = fs.readdirSync(dist).filter((file) => file.endsWith('.css'));
const addonCss = cssFiles.filter((file) => file !== 'canvas-runtime.css');
if (addonCss.length > 0) {
  throw new Error(
    `Canvas add-ons must not emit CSS; style them in base.css: ${addonCss.join(', ')}`,
  );
}
const css = cssFiles.map((file) => fs.readFileSync(path.join(dist, file), 'utf8')).join('\n');
const cssLiteral = JSON.stringify(css)
  .replaceAll('<', String.raw`\u003c`)
  .replaceAll('\u2028', String.raw`\u2028`)
  .replaceAll('\u2029', String.raw`\u2029`);
const inject = `(function(){if(document.getElementById('lobe-canvas-style'))return;var s=document.createElement('style');s.id='lobe-canvas-style';s.textContent=${cssLiteral};(document.head||document.documentElement).appendChild(s)})();\n`;

fs.writeFileSync(jsFile, inject + fs.readFileSync(jsFile, 'utf8'));
for (const file of cssFiles) fs.rmSync(path.join(dist, file));

const manifestSource = fs.readFileSync(
  path.resolve(here, '../../canvas/src/project/manifest.ts'),
  'utf8',
);
const CANVAS_RUNTIME_MAJOR = Number(/CANVAS_RUNTIME_MAJOR = (\d+)/.exec(manifestSource)[1]);
const target = path.resolve(here, `../../../public/canvas-runtime/v${CANVAS_RUNTIME_MAJOR}`);
fs.rmSync(target, { force: true, recursive: true });
fs.mkdirSync(target, { recursive: true });
const bytes = {};
for (const file of fs.readdirSync(dist).filter((name) => name.endsWith('.js'))) {
  fs.copyFileSync(path.join(dist, file), path.join(target, file));
  bytes[file] = fs.statSync(path.join(dist, file)).size;
}

console.log(JSON.stringify({ bytes, target }));
