import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace font-mono with font-sans, remove uppercase/tracking-widest from many places
code = code.replace(/font-mono/g, '');
code = code.replace(/uppercase/g, '');
code = code.replace(/tracking-widest/g, '');
code = code.replace(/tracking-\[0\.2em\]/g, '');

// Let's modify some specific text strings that are still "hacker" themed
code = code.replace(/CORE BREACHED/g, 'Lock Opened!');
code = code.replace(/CRITICAL ERROR/g, 'An error occurred');
code = code.replace(/BYPASS COMPLETE\. ACCESS GRANTED\./g, 'You successfully picked the lock.');
code = code.replace(/SECURE CONNECTION\. PROCEED ALONG ROUTE\./g, 'Great job! Let\'s move to the next concept.');
code = code.replace(/TUTORIAL SEQ\./g, 'Tutorial Step');
code = code.replace(/LVL 0\$\{currentLevelIdx \+ 1\} \/\/ \$\{LEVELS\[currentLevelIdx\]\.name\}/g, 'Level ${currentLevelIdx + 1}: ${LEVELS[currentLevelIdx].name}');

// Add bolding and some cleaner styles to the UI elements
code = code.replace(/text-\[10px\]/g, 'text-xs');
code = code.replace(/text-stone-500/g, 'text-stone-600');

fs.writeFileSync('src/App.tsx', code);
