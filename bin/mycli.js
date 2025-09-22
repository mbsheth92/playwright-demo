#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '..', 'package.json');
let version = '0.0.0';
try {
  version = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version || version;
} catch {}

const args = process.argv.slice(2);
if (args.includes('--version') || args.includes('-v')) {
  console.log(version);
  process.exit(0);
}
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: mycli [--version|-v] [--help|-h]');
  process.exit(0);
}

console.error('Unknown option');
process.exit(1);
