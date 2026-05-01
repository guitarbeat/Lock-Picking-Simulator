import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// The issue was we deleted part of the structure. Let's just remove the stray `</> )}` 
code = code.replace(/<\/>\s*\n\s*\)\}/, '');
code = code.replace(/<div className="mt-4 text-stone-600 text-xs   ">\s*<span className="text-stone-900">CONTROLS/g, '<div className="mt-4 text-stone-600 text-xs"><span className="text-stone-900">CONTROLS');

fs.writeFileSync('src/App.tsx', code);
