#!/usr/bin/env node
/** Zero-dependency audit of local links and media in Studio project pages. */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const SCAN_DIRS = ['work', 'projects', 'collections', 'pitch-decks', 'calendars', 'daily', 'case-studies', 'presentations'];
const ROOT_PAGES = ['index.html'];
const SHARED_STYLESHEETS = ['studio.css'];
const ATTRIBUTE = /(?:^|[\s<])(?:href|src|poster)\s*=\s*(["'])(.*?)\1/gi;
const SRCSET = /(?:^|[\s<])srcset\s*=\s*(["'])(.*?)\1/gi;
const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const STYLE_ATTRIBUTE = /(?:^|[\s<])style\s*=\s*(["'])(.*?)\1/gi;
const CSS_URL = /url\(\s*(?:(["'])(.*?)\1|([^)]*?))\s*\)/gi;
const CSS_IMPORT = /@import\s+(["'])(.*?)\1/gi;

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

function collectReferences(root, page, references, fileExists = existsSync) {
  const missing = [];
  for (const reference of references) {
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

function cssReferences(css) {
  // url(...) already covers @import url(...); quoted @import needs a separate check.
  return [
    ...[...css.matchAll(CSS_URL)].map(match => (match[2] ?? match[3]).trim()),
    ...[...css.matchAll(CSS_IMPORT)].map(match => match[2].trim()),
  ];
}

export function auditCss(root, stylesheet, css, fileExists = existsSync) {
  return collectReferences(root, stylesheet, cssReferences(css), fileExists);
}

export function auditHtml(root, page, html, fileExists = existsSync) {
  const references = [...html.matchAll(ATTRIBUTE)].map(match => match[2]);
  for (const match of html.matchAll(SRCSET)) {
    // Data URIs contain commas; skip mixed data-URI srcsets rather than invent false paths.
    if (match[2].includes('data:')) continue;
    for (const candidate of match[2].split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) references.push(url);
    }
  }
  for (const match of html.matchAll(STYLE_BLOCK)) references.push(...cssReferences(match[1]));
  for (const match of html.matchAll(STYLE_ATTRIBUTE)) references.push(...cssReferences(match[2]));
  return collectReferences(root, page, references, fileExists);
}

async function filesWithExtension(dir, extension) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const location = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await filesWithExtension(location, extension));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(extension)) files.push(location);
  }
  return files;
}

export async function auditProjectPages(root = REPO_ROOT) {
  const directories = SCAN_DIRS.map(dir => path.join(root, dir));
  const rootPages = ROOT_PAGES.map(file => path.join(root, file)).filter(existsSync);
  const pages = [...(await Promise.all(directories.map(dir => filesWithExtension(dir, '.html')))).flat(), ...rootPages].sort();
  const scopedStylesheets = (await Promise.all(directories.map(dir => filesWithExtension(dir, '.css')))).flat();
  const sharedStylesheets = SHARED_STYLESHEETS.map(file => path.join(root, file)).filter(existsSync);
  const stylesheets = [...scopedStylesheets, ...sharedStylesheets].sort();
  const broken = [];
  for (const page of pages) {
    const html = await readFile(page, 'utf8');
    for (const item of auditHtml(root, page, html)) broken.push({ page: path.relative(root, page), ...item });
  }
  for (const stylesheet of stylesheets) {
    const css = await readFile(stylesheet, 'utf8');
    for (const item of auditCss(root, stylesheet, css)) broken.push({ page: path.relative(root, stylesheet), ...item });
  }
  return { pages: pages.length, stylesheets: stylesheets.length, broken };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await auditProjectPages();
  for (const item of result.broken) {
    console.error(item.page + ': ' + item.reference + ' -> ' + (item.target ?? item.error));
  }
  console.log('Checked ' + result.pages + ' Studio HTML pages and ' + result.stylesheets + ' stylesheets; ' + result.broken.length + ' missing local references.');
  if (result.broken.length) process.exitCode = 1;
}
