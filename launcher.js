const path = require('path');

const args = process.argv.slice(2);
const flag = args.find((arg) => arg === 'q3' || arg === 'q4') || process.env.QUY_TRINH || process.env.MODE;

const targetMap = {
  q3: './quytrinh3/server.js',
  q4: './quytrinh4/server.js',
};

if (!flag || !targetMap[flag]) {
  console.error('Usage: npm run dev q3 | npm run dev q4');
  process.exit(1);
}

const target = targetMap[flag];
console.log(`[launcher] booting ${flag} -> ${target}`);
require(path.join(__dirname, target));
