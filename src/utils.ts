import path from 'path';
import { Header } from './interfaces';

export function keysToHeader(obj: {}): Header[] {
  return Object.keys(obj).map(key => ({
    id: key,
    title: key[0].toUpperCase() + key.slice(1)
  }));
}

export function getSection(file: string, section: string): string {
  const startIndex = file.indexOf(` [${section}]`);
  return file.slice(startIndex, file.indexOf('\n\n', startIndex));
}

export function getRunId(filename: string): string {
  return path.basename(filename).match(/(\d+)\.txt/)[1];
}
