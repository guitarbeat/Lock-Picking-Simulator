
import React, { useEffect, useRef, useState } from 'react';
import { GameState, LockState, TutorialStep, PinState, PickTool, GameMode, ViewMode } from './types';
import { cvService } from './services/cvService';
import { lockService } from './services/lockService';
import { audioService } from './services/audioService';
import GameCanvas from './components/GameCanvas';
import EducationalTip from './components/EducationalTip';
import { GuideOverlay } from './components/GuideOverlay';
import { DIMENSIONS, PICK_TOOLS, LEVELS } from './constants';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [pinCount, setPinCount] = useState<number>(3);
  const [lockState, setLockState] = useState<LockState>(lockService.getState());
  const [permissionGranted, setPermissionGranted] = useState(false);
    
// Game State
  const [currentPick, setCurrentPick] = useState<PickTool>(PICK_TOOLS[0]); 
    const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [inputMethod, setInputMethod] = useState<'MOUSE_KEYBOARD' | 'CAMERA' | 'GYRO'>('MOUSE_KEYBOARD');
  const [showCameraFeed, setShowCameraFeed] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [deviceParallax, setDeviceParallax] = useState({ x: 0, y: 0 });

    
  const manualInputRef = useRef({ active: false, x: 0.8, y: 0.5, torque: 0, isMouseDown: false, touchStartX: 0, touchStartY: 0, pickStartX: 0, pickStartY: 0, pointerId: -1 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
       if (gameState !== GameState.PLAYING) return;
       manualInputRef.current.active = true;
       
       switch (e.code) {
           case 'Space':
               manualInputRef.current.torque = Math.min(1, manualInputRef.current.torque + 0.1);
               e.preventDefault(); // prevent scrolling
               break;
           case 'KeyX':
               manualInputRef.current.torque = 0;
               break;
           case 'KeyC':
               lockService.reset();
               break;
           case 'KeyZ': {
               // Cycle pick
               setCurrentPick(prev => {
                   const idx = PICK_TOOLS.findIndex(p => p.id === prev.id);
                   return PICK_TOOLS[(idx + 1) % PICK_TOOLS.length];
               });
               break;
           }
           case 'KeyA':
               setGameState(GameState.LOADING);
               setPermissionGranted(false);
               break;
       }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (typeof (window as any).DeviceOrientationEvent !== 'undefined' && typeof (window as any).DeviceOrientationEvent.requestPermission !== 'function') {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [gameState]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState !== GameState.PLAYING) return;
    manualInputRef.current.active = true;
    manualInputRef.current.pointerId = e.pointerId;
    manualInputRef.current.isMouseDown = true;
    
    if (e.pointerType === 'mouse') {
        const rect = e.currentTarget.getBoundingClientRect();
        manualInputRef.current.x = (e.clientX - rect.left) / rect.width;
        manualInputRef.current.y = (e.clientY - rect.top) / rect.height;
    } else {
        manualInputRef.current.touchStartX = e.clientX;
        manualInputRef.current.touchStartY = e.clientY;
        manualInputRef.current.pickStartX = manualInputRef.current.x;
        manualInputRef.current.pickStartY = 0.5;
        manualInputRef.current.y = 0.5;
    }
    
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (gameState !== GameState.PLAYING) return;
      manualInputRef.current.active = true;
      if (e.pointerType === 'mouse') {
          const rect = e.currentTarget.getBoundingClientRect();
          manualInputRef.current.x = (e.clientX - rect.left) / rect.width;
          if (manualInputRef.current.isMouseDown) {
              manualInputRef.current.y = (e.clientY - rect.top) / rect.height;
          } else {
              manualInputRef.current.y = 0.5;
          }
      } else {
          if (manualInputRef.current.isMouseDown && e.pointerId === manualInputRef.current.pointerId) {
             const rect = e.currentTarget.getBoundingClientRect();
             const dx = (e.clientX - manualInputRef.current.touchStartX) / rect.width;
             const dy = (e.clientY - manualInputRef.current.touchStartY) / rect.height;
             const sensitivityX = 2.0;
             const sensitivityY = 2.0;
             manualInputRef.current.x = Math.max(0, Math.min(1, manualInputRef.current.pickStartX + dx * sensitivityX));
             manualInputRef.current.y = Math.max(0, Math.min(1, manualInputRef.current.pickStartY + dy * sensitivityY));
          }
      }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      if (gameState !== GameState.PLAYING) return;
      if (e.pointerId === manualInputRef.current.pointerId) {
          manualInputRef.current.isMouseDown = false;
          manualInputRef.current.y = 0.5;
      }
  };

  // Tutorial State
  
  // Initialize CV and Permissions
  useEffect(() => {
    const init = async () => {
      console.log("init called. inputMethod:", inputMethod, "permissionGranted:", permissionGranted);
      try {
        if (inputMethod === 'CAMERA' && !permissionGranted) {
            console.log("returning early because CAMERA and not permissionGranted");
            return;
        }
        
        if (inputMethod === 'CAMERA') {
            console.log("initializing camera...");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
              
              await cvService.initialize(videoRef.current);
            }
        }
        
        console.log("resetting lockService...");
        lockService.reset({ pinCount, gravity: 0.8, springConstant: 0.1 }); 
        console.log("setting game state to PLAYING...");
        setGameState(GameState.PLAYING);
        console.log("resuming audio...");
        audioService.resume();
        console.log("init complete");
      } catch (err: any) {
        console.error("Init error stack:", err?.stack, "message:", err?.message);
        setGameState(GameState.FAIL);
      }
    };
    
    if (gameState === GameState.LOADING) {
        console.log("gameState is LOADING, calling init");
        init();
    }
  }, [gameState, permissionGranted, inputMethod, pinCount]);

  // Main Game Loop & Tutorial Logic
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    let lastTime = performance.now();
    let frameId: number;

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000; 
      lastTime = time;

      // 1. Get Input
      let input = cvService.processFrame();
      
      if (inputMethod !== 'CAMERA' || manualInputRef.current.active) {
          // Tension decay
          if (manualInputRef.current.torque > 0) {
              manualInputRef.current.torque -= dt * 0.2; // decay
              if (manualInputRef.current.torque < 0) manualInputRef.current.torque = 0;
          }
          
          input = {
              pickPosition: { x: manualInputRef.current.x, y: manualInputRef.current.y },
              tensionTorque: manualInputRef.current.torque,
              isTracking: true
          };
      }

      // 2. Update Physics
      lockService.update(input, dt, currentPick.id);
      const currentLock = lockService.getState();

      // 3. Update React State for Render
      setLockState({ ...currentLock });

      

      // Check for success (Unlock)
      const allSet = currentLock.pins.every(p => p.state === PinState.SET);

      if (allSet && !currentLock.isUnlocked) {
          lockService.unlock();
          audioService.playOpen();
          
          // Delay showing the Success Screen to let animation play
          setTimeout(() => {
              setGameState(GameState.SUCCESS);
              
          }, 1000);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState, currentPick]); 

  

  
  
  const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (gameState !== GameState.PLAYING) return;
      
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      
      // Update visual parallax
      // map gamma (-90 to 90) to roughly +/- 15 degrees
      // map beta (-180 to 180) to roughly +/- 15 degrees
      setDeviceParallax({ 
          x: Math.min(15, Math.max(-15, (gamma / 90) * 15)), 
          y: Math.min(15, Math.max(-15, ((beta - 45) / 90) * 15)) 
      });

      manualInputRef.current.active = true;
      
      // Gamma (left/right tilt) from -90 to 90
      // Let's use tilting device right (positive gamma) to apply tension
      // Neutral is around 0. Full tension at ~40 degrees
      let tilt = Math.max(0, Math.min(40, gamma));
      manualInputRef.current.torque = tilt / 40.0;
  };

  return (
    <div className="relative w-screen h-screen bg-stone-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black flex flex-col items-center justify-center overflow-hidden text-stone-100 selection:bg-blue-500/30">
      
      {/* Video element for CV processing with visible feedback */}
      <div className={`absolute bottom-4 left-4 w-56 bg-stone-900 rounded-lg shadow-2xl border border-stone-800 overflow-hidden z-[100] pointer-events-auto flex flex-col transition-all duration-300 ${inputMethod !== 'CAMERA' || !showCameraFeed ? 'translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="bg-stone-950 px-3 py-2 text-xs font-bold text-stone-400 flex items-center justify-between border-b border-stone-200">
            <span>Camera Feed</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
              <button 
                onClick={() => setShowCameraFeed(false)}
                className="text-stone-400 hover:text-stone-300 p-1 rounded-sm hover:bg-stone-200 transition-colors"
                title="Minimize camera"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
        </div>
        <video ref={videoRef} className="w-full opacity-60 filter grayscale contrast-125 bg-stone-900" playsInline muted style={{ transform: 'scaleX(-1)' }} />
      </div>

      <div 
        className="relative w-full h-full bg-stone-950 overflow-hidden touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* MENU SCREEN */}
        {gameState === GameState.MENU && (
           <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-stone-950/80 backdrop-blur-sm">
             <div className="p-8 max-w-xl w-full flex flex-col items-center text-center">
                 <div className="mb-8">
                    <h1 className="text-4xl font-sans font-bold text-stone-100 tracking-tight mb-2 flex items-center justify-center gap-3">
                        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Lockpick Simulator
                    </h1>
                    <p className="font-sans text-stone-400">Learn how locks work from the inside out.</p>
                 </div>

                 <div className="bg-stone-900 border border-stone-800 p-6 rounded-xl w-full mb-8 text-left shadow-2xl">
                     <div className="flex justify-between items-center mb-4">
                         <h3 className="font-sans font-semibold text-stone-100">Choose how you want to play:</h3>
                         <button
                            onClick={() => setShowGuide(true)}
                            className="bg-orange-600/20 border border-orange-500/50 px-3 py-1.5 rounded-lg text-orange-400 hover:bg-orange-500 hover:text-white font-sans text-xs font-bold transition-colors flex items-center"
                         >
                            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Read Field Guide
                         </button>
                     </div>
                     <div className="mb-6 flex flex-col gap-2">
                         <label className="text-sm font-semibold text-stone-300">Number of Pins: {pinCount}</label>
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
                     <h3 className="font-sans font-semibold text-stone-100 mb-4">Input Method:</h3>
                     <div className="flex flex-col gap-3">
                         <button 
                             onClick={() => setInputMethod('MOUSE_KEYBOARD')}
                             className={`p-4 border rounded-xl font-sans text-sm text-left transition-colors flex items-center gap-4 ${inputMethod === 'MOUSE_KEYBOARD' ? 'border-orange-500 bg-orange-950/50' : 'border-stone-800 hover:bg-stone-800/50'}`}
                         >
                             <div className={`p-2 rounded-lg ${inputMethod === 'MOUSE_KEYBOARD' ? 'bg-orange-900 text-orange-400' : 'bg-stone-800 text-stone-400'}`}>
                                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                             </div>
                             <div>
                                <span className="font-semibold text-stone-100 block">Touch / Mouse & Keyboard</span>
                                <span className="text-stone-400">Drag to move pick. Tilt device, use spacebar, or on-screen buttons for tension.</span>
                             </div>
                         </button>
                         <button 
                             onClick={() => setInputMethod('CAMERA')}
                             className={`p-4 border rounded-xl font-sans text-sm text-left transition-colors flex items-center gap-4 ${inputMethod === 'CAMERA' ? 'border-orange-500 bg-orange-950/50' : 'border-stone-800 hover:bg-stone-800/50'}`}
                         >
                             <div className={`p-2 rounded-lg ${inputMethod === 'CAMERA' ? 'bg-orange-900 text-orange-400' : 'bg-stone-800 text-stone-400'}`}>
                                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                             </div>
                             <div>
                                <span className="font-semibold text-stone-100 block">Camera Tracking</span>
                                <span className="text-stone-400">Use your index finger to move the pick and wrist rotation for tension.</span>
                             </div>
                         </button>
                     </div>
                 </div>

                 <button 
                   onClick={async () => {
                     setPermissionGranted(true);
                     setGameState(GameState.LOADING);
                   }}
                   className="w-full px-8 py-4 bg-stone-100 text-stone-900 rounded-xl font-sans font-bold hover:bg-white transition-colors shadow-lg flex items-center justify-center gap-2"
                 >
                    Start Lockpicking
                 </button>
             </div>
           </div>
        )}

        {gameState === GameState.LOADING && (
           <div className="absolute inset-0 flex items-center justify-center z-20 text-orange-600 font-sans font-bold text-sm animate-pulse bg-stone-950/80 backdrop-blur-sm">
             Loading...
           </div>
        )}


        {gameState === GameState.SUCCESS && (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-stone-950/80 backdrop-blur-md text-stone-100">
     <div className="bg-stone-900 p-8 rounded-xl border border-stone-800 shadow-2xl max-w-sm w-full relative text-center">
         <h2 className="text-3xl font-sans font-bold text-stone-100 mb-2 flex items-center justify-center gap-2">
             <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
             UNLOCKED!
         </h2>
         <p className="text-stone-400 mb-8 text-sm font-sans">You successfully picked a {pinCount}-pin lock.</p>
         <button onClick={() => { lockService.reset({ pinCount, gravity: 0.8, springConstant: 0.1 }); setGameState(GameState.PLAYING); }} className="w-full px-6 py-4 bg-stone-900 text-white font-bold text-sm rounded shadow mt-4 hover:bg-stone-800 transition-colors">Try Again</button>
         <button onClick={() => { setGameState(GameState.MENU); }} className="w-full px-6 py-4 mt-2 bg-stone-800 text-stone-300 font-bold text-sm rounded shadow hover:bg-stone-700 transition-colors">Menu</button>
     </div>
  </div>
)}


        {gameState === GameState.FAIL && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-stone-950/80 backdrop-blur-md text-stone-100">
            <h2 className="text-3xl  font-bold text-red-500  mb-4  drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">An error occurred</h2>
            <p className="mb-8  text-xs text-stone-400   bg-stone-900 p-4 border border-stone-800 text-center rounded-lg">
              &gt; SENSOR ACCESS DENIED OR VISION LIBRARIES OFFLINE.<br/>
              &gt; CHECK OPTICAL HARDWARE.
            </p>
            <button 
              onClick={() => {
                window.location.reload();
              }}
              className="px-8 py-3 bg-red-500 text-white  font-bold   rounded-sm hover:bg-red-400"
            >
              RESTART SYSTEM
            </button>
          </div>
        )}

        {/* Main Canvas */}
        <div style={{ transform: gameState === GameState.PLAYING ? `perspective(1000px) rotateX(${deviceParallax.y}deg) rotateY(${deviceParallax.x}deg)` : 'none', transition: 'transform 0.1s ease-out' }} className="w-full h-full">
            <GameCanvas gameState={lockState} currentPick={currentPick} viewMode={ViewMode.SPLIT} />
        </div>

        {/* UI Overlay for Playing State */}
        {gameState === GameState.PLAYING && (
            <div className="absolute inset-0 pointer-events-none">
                {/* Settings / Info Panel (Top Left) */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {inputMethod === 'CAMERA' && showCameraFeed && (
                        <div className="flex items-center gap-2 bg-stone-900/90 px-3 py-2 rounded-lg border border-stone-800 shadow-sm backdrop-blur">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)] flex-shrink-0"></div>
                            <span className="text-xs font-bold font-sans text-stone-300">CAMERA ACTIVE</span>
                        </div>
                    )}
                    


                    
                </div>

                {/* View Mode & Controls (Top Right) */}
                <div className="absolute top-4 right-4 z-50 flex gap-2 pointer-events-auto">
                    <button
                        onClick={() => setShowGuide(true)}
                        className="bg-orange-600/90 border border-orange-500 px-4 py-2 rounded-lg text-white hover:bg-orange-500 font-sans text-xs font-bold transition-colors shadow-[0_0_15px_rgba(249,115,22,0.4)] flex items-center"
                    >
                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Field Guide
                    </button>
                    {inputMethod === 'CAMERA' && (
                        <button
                            onClick={() => setShowCameraFeed(prev => !prev)}
                            className="bg-stone-900/90 border border-stone-800 px-4 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 font-sans text-xs font-semibold transition-colors shadow-sm flex items-center"
                        >
                            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {showCameraFeed ? 'Hide Camera' : 'Show Camera'}
                        </button>
                    )}
                    
                    <button 
                        onClick={() => {
                            setGameState(GameState.MENU);
                            audioService.pause();
                        }}
                        className="bg-stone-900/90 border border-stone-800 px-4 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 font-sans text-xs font-semibold shadow-sm transition-colors flex items-center"
                    >
                         <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                         Back to Menu
                    </button>
                </div>

                                {/* Shared Bottom Left Controls (Desktop + Mobile) */}
                <div className="absolute bottom-8 left-8 z-50 pointer-events-auto">
                    {/* Interactive Tension Slider */}
                    <div 
                        className="flex flex-col gap-2 w-48 bg-stone-900/90 p-4 rounded-xl border border-stone-800 shadow-xl backdrop-blur pointer-events-auto"
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            e.currentTarget.setPointerCapture(e.pointerId);
                            // Calculate tension from click position
                            const rect = e.currentTarget.getBoundingClientRect();
                            const val = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                            manualInputRef.current.torque = val;
                        }}
                        onPointerMove={(e) => {
                            e.stopPropagation();
                            if ((e.buttons > 0 || e.pressure > 0) && e.currentTarget.hasPointerCapture(e.pointerId)) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const val = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                manualInputRef.current.torque = val;
                            }
                        }}
                        onPointerUp={(e) => {
                            e.stopPropagation();
                            // User can hold it or maybe let go and it robs tension?
                            // Let's release tension when they lift finger.
                            // Actually, let's keep it sticky for mouse/touch until they click 0?
                            // No, lock picking requires continuous hold. Let's make it snap to 0 on release.
                            manualInputRef.current.torque = 0;
                        }}
                        onPointerCancel={(e) => {
                            e.stopPropagation();
                            manualInputRef.current.torque = 0;
                        }}
                    >
                        <div className="flex justify-between items-center text-xs text-stone-300 font-bold font-sans select-none">
                           <span className="flex items-center gap-1">
                               <svg className="w-3 h-3 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                               </svg>
                               TENSION
                           </span>
                           <span>{ (lockState.totalTorque * 100).toFixed(0) }%</span>
                        </div>
                        <div className="h-6 w-full bg-stone-800 rounded-full overflow-hidden relative cursor-crosshair">
                            <div 
                                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-none pointer-events-none"
                                style={{ width: `${lockState.totalTorque * 100}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase font-bold text-white/50 pointer-events-none tracking-widest">
                                Drag to Apply
                            </div>
                        </div>
                        <div className="text-[10px] text-stone-500 text-center leading-tight">
                            Tension is required to bind pins. Too much will trap them.
                        </div>
                    </div>
                </div>

                {/* Mobile controls overlay */}
                {inputMethod !== 'CAMERA' && (
                    <div className="absolute bottom-8 left-8 right-8 flex justify-between z-50 pointer-events-none md:hidden">
                        

                        <button 
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white w-20 h-20 rounded-full shadow-2xl flex flex-col items-center justify-center pointer-events-auto active:bg-white/30 active:scale-95 transition-all select-none mt-4"
                            onPointerDown={(e) => {
                               e.preventDefault(); 
                               e.stopPropagation();
                               setCurrentPick(prev => {
                                   const idx = PICK_TOOLS.findIndex(p => p.id === prev.id);
                                   return PICK_TOOLS[(idx + 1) % PICK_TOOLS.length];
                               });
                            }}
                        >
                            <span className="text-xs font-bold font-sans tracking-widest opacity-80 mt-1">SWAP</span>
                            <span className="text-sm font-bold font-sans">TOOL</span>
                        </button>
                    </div>
                )}
            </div>
        )}
        
      </div>
      {showGuide && <GuideOverlay onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default App;
