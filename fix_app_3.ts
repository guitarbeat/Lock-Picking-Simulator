import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add showCameraFeed state
code = code.replace(
  /const \[inputMethod, setInputMethod\] = useState<'MOUSE_KEYBOARD' \| 'CAMERA' \| 'GYRO'>\('MOUSE_KEYBOARD'\);/,
  `const [inputMethod, setInputMethod] = useState<'MOUSE_KEYBOARD' | 'CAMERA' | 'GYRO'>('MOUSE_KEYBOARD');
  const [showCameraFeed, setShowCameraFeed] = useState<boolean>(true);`
);

// Update Camera Feed div to toggle visibility
code = code.replace(
  /className=\{`absolute bottom-4 left-4 w-56 bg-white rounded-lg shadow-2xl border border-stone-200 overflow-hidden z-\[100\] pointer-events-none flex flex-col transition-opacity \$\{inputMethod !== 'CAMERA' \? 'hidden' : ''\}`\}/,
  `className={\`absolute bottom-4 left-4 w-56 bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden z-[100] pointer-events-none flex flex-col transition-opacity \$\{inputMethod !== 'CAMERA' || !showCameraFeed ? 'hidden' : ''\}\`}`
);

// Add top right toggle button
code = code.replace(
  /<div className="absolute top-4 right-4 z-50 flex gap-2">/,
  `<div className="absolute top-4 right-4 z-50 flex gap-2">
                {inputMethod === 'CAMERA' && (
                    <button
                        onClick={() => setShowCameraFeed(prev => !prev)}
                        className="bg-white/90 border border-stone-200 px-3 py-2 rounded text-stone-600 hover:text-stone-900 font-sans text-xs font-semibold transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {showCameraFeed ? 'Hide Camera' : 'Show Camera'}
                    </button>
                )}`
);

code = code.replace(/uppercase/g, ''); // just make sure we are not uppercase
code = code.replace(/text-\[10px\]/g, 'text-xs'); // change to xs for readability
code = code.replace(/font-mono/g, ''); // Ensure no monospace except code potentially

// Make the Split View and Menu Buttons match sans-serif
code = code.replace(/bg-white\/90 border border-stone-200 px-3 py-2 rounded text-stone-500 hover:text-stone-900 font-sans text-xs  transition-colors/g, 'bg-white/90 border border-stone-200 px-3 py-2 rounded text-stone-600 hover:text-stone-900 font-sans text-xs font-semibold transition-colors shadow-sm');

fs.writeFileSync('src/App.tsx', code);
