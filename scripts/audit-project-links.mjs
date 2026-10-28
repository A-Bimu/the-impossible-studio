#!/usr/bin/env node
/** Zero-dependency audit of local links and media in Studio project pages. */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const SCAN_DIRS = ['work', 'calendars', 'daily', 'case-studies'];
const ATTRIBUTE = /\b(?:href|src|poster)\s*=\s*(["'])(.*?)\1/gi;

export function resolveLocalReference(root, page, value) {
  const reference = value.trim().replaceAll('&amp;', '&');
  if (!reference || reference.startsWith('#') || /^(?:\/\/|[a-z][a-z\d+.-]*:)/i.test(reference)) return null;
  const base = 'https://studio.invalid/' + path.relative(root, page).split(path.sep).join('/');
  const url = new URL(reference, base);
  if (url.origin !== 'https://studio.invalid') return null;
  const pathname = decodeURIComponent(url.pathname);
  let target = path.resolve(root, pathname.replace(/^\/+/, ''));
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new Error('Reference escapes repository: ' + value);
  }
  if (pathname.endsWith('/')) target = path.join(target, 'index.html');
  return target;
}

export function auditHtml(root, page, html, fileExists = existsSync) {
  const missing = [];
  for (const match of html.matchAll(ATTRIBUTE)) {
    const reference = match[2];
    try {
      const target = resolveLocalReference(root, page, reference);
      if (target && !fileExists(target)) {
        missing.push({ reference, target: path.relative(root, target) });
      }
    } catch (error) {
      missing.push({ reference, error: error.message });
    }
  }
  return missing;
}

async function htmlFiles(dir) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const location = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(location));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(location);
  }
  return files;
}

export async function auditProjectPages(root = REPO_ROOT) {
  const pages = (await Promise.all(SCAN_DIRS.map(dir => htmlFiles(path.join(root, dir))))).flat().sort();
  const broken = [];
  for (const page of pages) {
    const html = await readFile(page, 'utf8');
    for (const item of auditHtml(root, page, html)) {
      broken.push({ page: path.relative(root, page), ...item });
    }
  }
  return { pages: pages.length, broken };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await auditProjectPages();
  for (const item of result.broken) {
    console.error(item.page + ': ' + item.reference + ' -> ' + (item.target ?? item.error));
  }
  console.log('Checked ' + result.pages + ' Studio project HTML pages; ' + result.broken.length + ' missing local references.');
  if (result.broken.length) process.exitCode = 1;
}
