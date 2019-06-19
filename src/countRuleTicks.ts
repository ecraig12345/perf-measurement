import { CallRecord } from './processCallRecords';

export interface RuleTicks {
  [ruleName: string]: number;
}

/**
 * Count the number of total ticks consumed by each tslint rule
 */
export function countRuleTicks(callRecords: CallRecord[]): RuleTicks {
  const ruleTicks: RuleTicks = {};
  for (const record of callRecords) {
    // Types of rule paths:
    // tslint/lib/rules/noShadowedVariableRule.js:108:27
    // tslint-react/rules/jsxCurlySpacingRule.js:80:55
    // tslint-microsoft-contrib/noWithStatementRule.js:47:58
    const ruleMatch = record.path.match(/\/(rules|tslint-microsoft-contrib)\/(\w+)/);
    if (ruleMatch) {
      const ruleFile = ruleMatch[2];
      ruleTicks[ruleFile] = (ruleTicks[ruleFile] || 0) + record.ticks;
    }
  }
  return ruleTicks;

  // const ruleRecords = Object.entries(ruleTicks).sort((a, b) => b[1] - a[1]);
  // const writer = csv.createArrayCsvWriter({
  //   header: ['Rule', 'Ticks'],
  //   path: getFilename('ruleTicks', filename, i)
  // });
  // await writer.writeRecords(ruleRecords);
}
