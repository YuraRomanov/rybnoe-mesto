import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data');

function ensureDataDir() {
  mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name) {
  return join(DATA_DIR, name);
}

export function readJson(name, fallback) {
  ensureDataDir();
  const path = filePath(name);
  if (!existsSync(path)) return structuredClone(fallback);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return structuredClone(fallback);
  }
}

export function writeJson(name, data) {
  ensureDataDir();
  writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf8');
}
