const fs = require('fs');
const { processDir } = require('./lib/index');

const args = process.argv.slice(process.argv.findIndex(arg => arg.includes('run.js')) + 1);
let dir = args[0];
if (!dir) {
  throw 'must specify directory via command line';
}
if (!fs.existsSync(dir)) {
  throw dir + ' does not exist';
}

processDir(dir);
