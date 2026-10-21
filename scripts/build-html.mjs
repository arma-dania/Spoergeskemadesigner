// Bygger spoergeskemadesigner.jsx til én selvstændig index.html
// (React, app-kode og Tailwind-CSS lægges inline - kun Google Fonts hentes udefra).
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(join(tmpdir(), 'spoergeskema-'));

try {
  // 1. JavaScript: app + React i én minificeret IIFE
  const js = await build({
    entryPoints: [join(root, 'scripts/entry.jsx')],
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2019',
    jsx: 'automatic',
    loader: { '.jsx': 'jsx' },
    define: { 'process.env.NODE_ENV': '"production"' },
    write: false,
  });
  const jsCode = js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

  // 2. CSS: kun de Tailwind-klasser, som komponenten faktisk bruger
  const inputCss = join(tmp, 'input.css');
  const outputCss = join(tmp, 'output.css');
  writeFileSync(inputCss, '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
  execFileSync(process.execPath, [
    join(root, 'node_modules/tailwindcss/lib/cli.js'),
    '-i', inputCss,
    '-o', outputCss,
    '--content', join(root, 'spoergeskemadesigner.jsx'),
    '--minify',
  ], { stdio: 'inherit' });
  const css = readFileSync(outputCss, 'utf8');

  // 3. Saml det hele
  const html = `<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Spørgeskemadesigner</title>
<meta name="description" content="Fra emne til spørgsmål - struktureret guide til spørgeskemadesign i markedsanalyse.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<noscript>Spørgeskemadesigneren kræver JavaScript.</noscript>
<!-- Genereret af scripts/build-html.mjs ud fra spoergeskemadesigner.jsx - redigér ikke denne fil direkte. -->
<script>${jsCode}</script>
</body>
</html>
`;
  writeFileSync(join(root, 'index.html'), html);
  console.log(`index.html skrevet (${(html.length / 1024).toFixed(0)} KB)`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
