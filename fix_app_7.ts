import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace SUCCESS block using regex since line matching is failing
code = code.replace(
  /\{gameState === GameState\.SUCCESS && \([\s\S]*?\}\)/,
  `{gameState === GameState.SUCCESS && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-stone-100/90 backdrop-blur-md text-stone-900">
             <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-2xl max-w-sm w-full relative text-center">
                 <h2 className="text-3xl font-sans font-bold text-stone-900 mb-2 flex items-center justify-center gap-2">
                     <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                     UNLOCKED!
                 </h2>
                 <p className="text-stone-500 mb-8 text-sm font-sans">You successfully picked a {pinCount}-pin lock.</p>
                 <button 
                     onClick={() => {
                        lockService.reset({ pinCount, gravity: 0.8, springConstant: 0.1 }); 
                        setGameState(GameState.PLAYING);
                     }}
                     className="w-full px-6 py-4 bg-stone-900 text-white font-bold text-sm rounded-lg shadow-sm mt-4 hover:bg-stone-800 transition-colors cursor-pointer"
                 >
                     Try Again
                 </button>
                 <button 
                     onClick={() => {
                         setGameState(GameState.MENU);
                     }}
                     className="w-full px-6 py-4 mt-2 bg-stone-100 text-stone-600 font-bold text-sm rounded-lg shadow-sm hover:bg-stone-200 transition-colors cursor-pointer"
                 >
                     Menu
                 </button>
             </div>
          </div>
        )}`
);

// We can also safely remove formatTime, and any references to formatTime
code = code.replace(/const formatTime \= \([\s\S]*?\}\;/, '');

fs.writeFileSync('src/App.tsx', code);
