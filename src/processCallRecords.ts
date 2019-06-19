import csv from 'csv-writer';
import path from 'path';

import { getSection, keysToHeader, getRunId } from './utils';

export interface CallRecord {
  ticks: number;
  total: string;
  // nonlib: string; // not very interesting
  type: string;
  name: string;
  path?: string;
}

/**
 * Read JS call records from a processed profile file and write them to a CSV file.
 * Also return the call records in case the caller wants them.
 * @param file Processed profile file contents, possibly with some cleanup already done
 * (like shortening paths)
 * @param filename Path to the processed profile file (will be used to generate CSV filename)
 */
export async function processCallRecords(file: string, filename: string): Promise<CallRecord[]> {
  // a few lines down there will be a section like:
  //   [JavaScript]:
  //     ticks  total  nonlib   name
  // followed by a bunch of lines like:
  //     3993   31.4%   31.8%  Builtin: LoadIC
  //      409    3.2%    3.3%  LazyCompile: ~forEachChild typescript/lib/typescript.js:14026:26
  // (read the section and get rid of the header lines)
  const jsCalls = getSection(file, 'JavaScript')
    .split('\n')
    .slice(2);
  const callRecords: CallRecord[] = [];
  for (const line of jsCalls) {
    // ticks total nonlib type name path?
    const match = line.match(/^ +(\S+) +(\S+) +(\S+) +([^\s:]+): (\S+) ?(\S*)$/);
    // exclude blank lines
    if (match) {
      callRecords.push({
        ticks: Number(match[1]),
        total: match[2],
        // nonlib: match[3],
        type: match[4],
        name: match[5],
        path: match[6] || ''
      });
    }
  }
  const callWriter = csv.createObjectCsvWriter({
    path: getFilename('jscalls', filename),
    header: keysToHeader(callRecords[0])
  });
  await callWriter.writeRecords(callRecords);
  return callRecords;
}

function getFilename(prefix: string, origFilename: string) {
  const dir = path.dirname(origFilename);
  const filename = `${prefix}${getRunId(origFilename)}.csv`;
  return path.join(dir, filename);
}
