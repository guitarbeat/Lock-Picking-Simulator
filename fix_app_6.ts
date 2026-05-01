import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add pin count state
code = code.replace(
  /const \[gameState, setGameState\] = useState<GameState>\(GameState\.MENU\);/,
  `const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [pinCount, setPinCount] = useState<number>(3);`
);

// 2. Remove currentView and setCurrentView
code = code.replace(
  /const \[currentView, setCurrentView\] = useState<ViewMode>\(ViewMode\.SPLIT\);\n/,
  ''
);

// 3. Remove GameMode/Tutorial logic
code = code.replace(
  /const \[gameMode, setGameMode\] = useState<GameMode>\(GameMode\.TUTORIAL\);\n/,
  ''
);

code = code.replace(
  /const \[tutorialStep, setTutorialStep\] = useState<TutorialStep>\(TutorialStep\.WAITING_FOR_HAND\);\n  const \[instruction, setInstruction\] = useState<string>\("Initializing..."\);\n  const \[progress, setProgress\] = useState<number>\(0\); \n  const tutorialTimerRef = useRef<number>\(0\);\n/,
  ''
);

// Replace tutorial init with simple reset
code = code.replace(
  /\/\/ Start with Tutorial config\n\s*setGameMode\(GameMode\.TUTORIAL\);\n\s*lockService\.reset\(\{ pinCount: 3, gravity: 0\.8, springConstant: 0\.1 \}\); \n\s*setGameState\(GameState\.PLAYING\);\n\s*setTutorialStep\(TutorialStep\.WAITING_FOR_HAND\);/,
  `lockService.reset({ pinCount, gravity: 0.8, springConstant: 0.1 }); 
        setGameState(GameState.PLAYING);`
);

// Remove the entire TUTORIAL LOGIC section
code = code.replace(
  /\/\/ --- TUTORIAL LOGIC ---\s*if \(gameMode === GameMode\.TUTORIAL && !currentLock\.isUnlocked\) \{[\s\S]*?\n\s*\}\n\n\s*\/\/ Check for success/,
  `// Check for success`
);

code = code.replace(
  /if \(gameMode === GameMode\.CAMPAIGN && !currentLock\.isUnlocked\) \{\n\s*setLevelTime\(prev => prev \+ dt\);\n\s*\}/,
  ''
);

// Remove tutorial completed from success screen
code = code.replace(
  /if \(gameMode === GameMode\.TUTORIAL\) \{\n\s*setTutorialStep\(TutorialStep\.COMPLETED\);\n\s*setInstruction\("LOCK OPEN"\);\n\s*\}/,
  ''
);


// 4. Update GameCanvas props
code = code.replace(
  /<GameCanvas gameState=\{lockState\} currentPick=\{currentPick\} viewMode=\{currentView\} \/>/,
  `<GameCanvas gameState={lockState} currentPick={currentPick} viewMode={ViewMode.SPLIT} />`
);

// 5. Build new UI Overlay
code = code.replace(
  /\{\/\* Tutorial Instructions \*\/\}[\s\S]*?\{formatTime\(levelTime\)\}\n\s*<\/div>\n\s*\)\}/,
  ''
);

// Remove view toggle button
code = code.replace(
  /<button\s*onClick=\{[^}]*setCurrentView[\s\S]*?<\/button>/,
  ''
);

code = code.replace(
  /Start Tutorial/,
  'Start Lockpicking'
);

code = code.replace(
  /<button\s*onClick=\{\(\) => \{\s*if \(gameMode === GameMode\.TUTORIAL\) \{[\s\S]*?<\/button>/,
  `<button 
                        onClick={() => {
                            setGameState(GameState.MENU);
                            audioService.pause();
                        }}
                        className="bg-white/90 border border-stone-200 px-4 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-white font-sans text-xs font-semibold shadow-sm transition-colors flex items-center"
                    >
                         <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                         Back to Menu
                    </button>`
);

// Add Pin Count selector to MENU SCREEN
code = code.replace(
  /Choose how you want to play:<\/h3>/,
  `Choose how you want to play:</h3>
                     <div className="mb-6 flex flex-col gap-2">
                         <label className="text-sm font-semibold text-stone-700">Number of Pins: {pinCount}</label>
                         <input 
                             type="range" 
                             min="1" 
                             max="7" 
                             value={pinCount} 
                             onChange={(e) => setPinCount(parseInt(e.target.value))}
                             className="w-full accent-orange-500"
                         />
                         <div className="flex justify-between text-xs text-stone-400">
                             <span>1 (Easy)</span>
                             <span>7 (Hard)</span>
                         </div>
                     </div>
                     <h3 className="font-sans font-semibold text-stone-900 mb-4">Input Method:</h3>`
);

// Ensure levelTime import/states are removed
code = code.replace(
  /const \[levelTime, setLevelTime\] = useState\(0\);\n\s*const \[bestTimes, setBestTimes\] = useState<Record<number, number>>\(\{\}\);\n/,
  ''
);

fs.writeFileSync('src/App.tsx', code);
