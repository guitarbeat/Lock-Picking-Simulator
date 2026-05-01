import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// The snippet from line 399-429 roughly needs to be matched. Use a regex to remove the toolkit entirely.
// Find `{/* TOOLKIT SIDEBAR */}` entirely.
code = code.replace(/\{\/\* TOOLKIT SIDEBAR \*\/\}[\s\S]*?<\/div>\n            \)\}/, '');


fs.writeFileSync('src/App.tsx', code);
