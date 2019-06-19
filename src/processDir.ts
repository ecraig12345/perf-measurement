import fs from 'fs';
import path from 'path';
import glob from 'glob';
import csv from 'csv-writer';

import { Header, Omit, SummaryCallRecord } from './interfaces';
import { getSection, getRunId } from './utils';

export interface RunRecord {
  runId: string;
  ticks: number;
  // ruleTicks?: RuleTicks;
  // calls: CallRecord[];
  realTime: number;
  cpuTime: number;
  jsTicks: number;
  cppTicks: number;
  gcTicks: number;
  sharedTicks: number;
  unaccountedTicks: number;
}

async function processFile(filename: string): Promise<Omit<RunRecord, 'realTime' | 'cpuTime'>> {
  const file = fs
    .readFileSync(filename)
    .toString()
    .replace(/\b \/.*\/node_modules\/?/g, ' ');

  // const cppSection = getSection(file, 'C++');

  const summarySection = getSection(file, 'Summary');
  const summaryLines = summarySection.split('\n').slice(2);
  const summaryItems: { [key: string]: number } = {};
  // format:
  //  ticks  total  nonlib   name
  //  9011   44.8%   45.4%  JavaScript
  // here we only care about ticks and name
  for (const line of summaryLines) {
    const match = line.match(/^ +(\d+) +([\d.%]+ +){1,2}(.*)$/);
    summaryItems[match[3]] = Number(match[1]);
  }

  return {
    runId: getRunId(filename),
    ticks: Number(file.match(/(\d+) ticks/)[1]),
    jsTicks: summaryItems['JavaScript'],
    cppTicks: summaryItems['C++'],
    gcTicks: summaryItems['GC'],
    sharedTicks: summaryItems['Shared libraries'],
    unaccountedTicks: summaryItems['Unaccounted']
  };
}

function addTimeData(records: RunRecord[], dir: string) {
  const times = fs
    .readFileSync(path.join(dir, 'time.txt'))
    .toString()
    .trim()
    .split('\n\n');
  for (let i = 0; i < records.length; i++) {
    // real	0m15.666s
    // user	0m21.920s
    // sys	0m1.612s
    const timeData = times[i].split('\n').map(time => time.split('\t'));
    const timeObj: { sys: number; user: number; real: number } = {} as any;
    for (let timeRow of timeData) {
      const match = timeRow[1].match(/^(\d+)m([\d.]+)s/);
      (timeObj as any)[timeRow[0]] = Number(match[1]) * 60 + Number(match[2]);
    }
    // https://stackoverflow.com/questions/556405/what-do-real-user-and-sys-mean-in-the-output-of-time1/556411#556411
    records[i].cpuTime = timeObj.sys + timeObj.user;
    records[i].realTime = timeObj.real;
  }
}

export async function processDir(dir: string) {
  const paths = glob.sync(path.join(dir, 'processed*'));
  const runRecords = (await Promise.all(paths.map(processFile))) as RunRecord[];
  addTimeData(runRecords, dir);

  const writer = csv.createObjectCsvWriter({
    path: path.join(dir, 'result.csv'),
    header: [
      { id: 'runId', title: 'Run ID' },
      { id: 'ticks', title: 'Ticks' },
      { id: 'realTime', title: 'Real time' },
      { id: 'cpuTime', title: 'CPU time' },
      { id: 'jsTicks', title: 'JS ticks' },
      { id: 'cppTicks', title: 'C++ ticks' },
      { id: 'gcTicks', title: 'GC ticks' },
      { id: 'sharedTicks', title: 'Shared lib ticks' },
      { id: 'unaccountedTicks', title: 'Unaccounted ticks' }
    ]
  });
  await writer.writeRecords(runRecords);
}
