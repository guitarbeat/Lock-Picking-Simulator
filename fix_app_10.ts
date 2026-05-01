import * as fs from "fs";

let code = fs.readFileSync("src/App.tsx", "utf-8");

const startIdx = code.indexOf("{gameState === GameState.SUCCESS && (");
const endIdx = code.indexOf("{gameState === GameState.FAIL && (");

const newSuccess = \`{gameState === GameState.SUCCESS && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-stone-100/90 backdrop-blur-md text-stone-900">
             <div className="bg-white p-8 rounded border border-stone-200 shadow-2xl max-w-sm w-full relative">
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-stone-900 text-xs  font-bold   opacity-70">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        <span>SYS_STATUS: BYPASSED</span>
                    </div>
                 </div>
                 
                 <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_25%,rgba(255,255,255,0.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.2)_75%,rgba(255,255,255,0.2)_100%)] bg-[length:4px_4px]"></div>

                 <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500 rounded-sm flex items-center justify-center mx-auto mb-6">
                     <svg className="w-8 h-8 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <h2 className="text-3xl font-bold mb-2 text-center text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">Lock Opened!</h2>
                 <div className="w-full h-px bg-[#333333] mb-4"></div>
                 
                 <p className="text-stone-600 text-xs text-center mb-4 bg-stone-50 p-2 border border-stone-200">
                     &gt; YOU SUCCESSFULLY PICKED A {\`\${pinCount}\`}-PIN LOCK
                 </p>
                 <button 
                     onClick={() => {
                        lockService.reset({ pinCount, gravity: 0.8, springConstant: 0.1 }); 
                        setGameState(GameState.PLAYING);
                     }}
                     className="w-full px-6 py-4 bg-orange-500 text-[#050505] font-bold text-sm rounded-sm hover:bg-white transition-colors cursor-pointer"
                 >
                     Try Again
                 </button>
                 <button 
                     onClick={() => {
                         setGameState(GameState.MENU);
                     }}
                     className="w-full px-6 py-4 mt-2 border border-stone-200 bg-transparent text-stone-900 hover:bg-orange-500 hover:text-[#050505] font-bold text-sm rounded-sm transition-colors cursor-pointer"
                 >
                     Menu
                 </button>
             </div>
          </div>
        )}

        \`;

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newSuccess + code.substring(endIdx);
}
fs.writeFileSync("src/App.tsx", code);
