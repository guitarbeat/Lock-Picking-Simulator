const fs = require('fs');
let c = fs.readFileSync('src/components/GuideOverlay.tsx', 'utf8');

c = c.replace(/className="text-stone-200"/g, 'className="text-[#e0e0e0]"');
c = c.replace(/marker:text-stone-600/g, 'marker:text-[#f97316]');
c = c.replace(/bg-stone-800\/50/g, 'bg-[#1a1a1a]');
c = c.replace(/border-stone-700\/50/g, 'border-[#333]');
c = c.replace(/bg-red-900\/10/g, 'bg-red-900/20');
c = c.replace(/text-red-200/g, 'text-red-400');

fs.writeFileSync('src/components/GuideOverlay.tsx', c);
