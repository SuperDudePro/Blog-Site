import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

const ORIGIN = 'https://ourolddad.com';
const ROOT = process.cwd();
const PUBLIC = resolve(ROOT, 'public');
const DIST = resolve(ROOT, 'dist');
const SITEMAP = resolve(ROOT, 'public/sitemap.xml');
const SOURCE_ROOTS = ['src', 'index.html'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs