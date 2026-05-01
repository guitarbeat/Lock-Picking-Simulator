import React, { useEffect, useRef, useState } from "react";
import {
  GameState,
  LockState,
  TutorialStep,
  PinState,
  PickTool,
  GameMode,
  ViewMode,
} from "./types";
import { cvService } from "./services/cvService";
import { lockService } from "./services/lockService";
import { audioService } from "./services/audioService";
import GameCanvas from "./components/GameCanvas";
import { GuideOverlay } from "./components/GuideOverlay";
import { DIMENSIONS, PICK_TOOLS, LEVELS } from "./constants";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [pinCount, setPinCount] = useState<number>(3);
  const [lockState, setLockState] = useState<LockState>(lockService.getState());
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Game State
  const [currentPick, setCurrentPick] = useState<PickTool>(PICK_TOOLS[0]);
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [inputMethod, setInputMethod] = useState<
    "MOUSE_KEYBOARD" | "CAMERA" | "GYRO"
  >("MOUSE_KEYBOARD");
  const [showCameraFeed, setShowCameraFeed] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [deviceParallax, setDeviceParallax] = useState({ x: 0, y: 0 });

  const manualInputRef = useRef({
    active: false,
    x: 0.8,
    y: 0.5,
    torque: 0,
    isMouseDown: false,
    touchStartX: 0,
    touchStartY: 0,
    pickStartX: 0,
    pickStartY: 0,
    pointerId: -1,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;
      manualInputRef.current.active = true;

      switch (e.code) {
        case "Space":
          manualInputRef.current.torque = Math.min(
            1,
            manualInputRef.current.torque + 0.1,
          );
          e.preventDefault(); // prevent scrolling
          break;
        case "KeyX":
          manualInputRef.current.torque = 0;
          break;
        case "KeyC":
          lockService.reset();
          break;
        case "KeyZ": {
          // Cycle pick
          setCurrentPick((prev) => {
            const idx = PICK_TOOLS.findIndex((p) => p.id === prev.id);
            return PICK_TOOLS[(idx + 1) % PICK_TOOLS.length];
          });
          break;
        }
        case "KeyA":
          setGameState(GameState.LOADING);
          setPermissionGranted(false);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;
      if (e.code === "Space") {
        manualInputRef.current.torque = 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    if (
      typeof (window as any).DeviceOrientationEvent !== "undefined" &&
      typeof (window as any).DeviceOrientationEvent.requestPermission !==
        "function"
    ) {
      window.addEventListener("deviceorientation", handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [gameState]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState !== GameState.PLAYING) return;
    manualInputRef.current.active = true;
    manualInputRef.current.pointerId = e.pointerId;
    manualInputRef.current.isMouseDown = true;

    if (e.pointerType === "mouse") {
      const rect = e.currentTarget.getBoundingClientRect();
      manualInputRef.current.x = (e.clientX - rect.left) / rect.width;
      manualInputRef.current.y = (e.clientY - rect.top) / rect.height;
    } else {
      manualInputRef.current.touchStartX = e.clientX;
      manualInputRef.current.touchStartY = e.clientY;
      manualInputRef.current.pickStartX = manualInputRef.current.x;
      manualInputRef.current.pickStartY = manualInputRef.current.y;
    }

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState !== GameState.PLAYING) return;
    manualInputRef.current.active = true;

    if (e.pointerType === "mouse") {
      const rect = e.currentTarget.getBoundingClientRect();
      manualInputRef.current.x = (e.clientX - rect.left) / rect.width;
      manualInputRef.current.y = (e.clientY - rect.top) / rect.height;
    } else {
      if (
        manualInputRef.current.isMouseDown &&
        e.pointerId === manualInputRef.current.pointerId
      ) {
        const rect = e.currentTarget.getBoundingClientRect();
        const dx =
          (e.clientX - manualInputRef.current.touchStartX) / rect.width;
        const dy =
          (e.clientY - manualInputRef.current.touchStartY) / rect.height;

        // Dynamic sensitivity: faster horizontal relative trackpad, scaled vertical
        const aspect = rect.height / rect.width;
        const sensitivityX = 1.5;
        const sensitivityY = 1.5 * aspect;

        manualInputRef.current.x = Math.max(
          0,
          Math.min(1, manualInputRef.current.pickStartX + dx * sensitivityX),
        );
        manualInputRef.current.y = Math.max(
          0,
          Math.min(1, manualInputRef.current.pickStartY + dy * sensitivityY),
        );
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (gameState !== GameState.PLAYING) return;
    if (e.pointerId === manualInputRef.current.pointerId) {
      manualInputRef.current.isMouseDown = false;
      // Note: we no longer reset y to 0.5! This means the pick rests where it was left.
    }
  };

  // Tutorial State

  // Initialize CV and Permissions
  useEffect(() => {
    const init = async () => {
      console.log(
        "init called. inputMethod:",
        inputMethod,
        "permissionGranted:",
        permissionGranted,
      );
      try {
        if (inputMethod === "CAMERA" && !permissionGranted) {
          console.log(
            "returning early because CAMERA and not permissionGranted",
          );
          return;
        }

        if (inputMethod === "CAMERA") {
          console.log("initializing camera...");
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
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
        console.error(
          "Init error stack:",
          err?.stack,
          "message:",
          err?.message,
        );
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

      if (inputMethod !== "CAMERA" || manualInputRef.current.active) {
        // Natural pick gravity when not actively holding the pick
        if (!manualInputRef.current.isMouseDown) {
          // smoothly return to a resting Y position (0.5 to 0.7 is lower in keyway)
          manualInputRef.current.y += (0.6 - manualInputRef.current.y) * dt * 5;
        }

        input = {
          pickPosition: {
            x: manualInputRef.current.x,
            y: manualInputRef.current.y,
          },
          tensionTorque: manualInputRef.current.torque,
          isTracking: true,
        };
      }

      // 2. Update Physics
      lockService.update(input, dt, currentPick.id);
      const currentLock = lockService.getState();

      // 3. Update React State for Render
      setLockState({ ...currentLock });

      // Check for success (Unlock)
      const allSet = currentLock.pins.every((p) => p.state === PinState.SET);

      if (allSet && !currentLock.isUnlocked) {
        lockService.unlock();
        audioService.playOpen();

        // Delay showing the Success Screen to let animation play
        // setTimeout(() => {
        //   setGameState(GameState.SUCCESS);
        // }, 1000);
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
      y: Math.min(15, Math.max(-15, ((beta - 45) / 90) * 15)),
    });

    manualInputRef.current.active = true;

    // Gamma (left/right tilt) from -90 to 90
    // Let's use tilting device right (positive gamma) to apply tension
    // Neutral is around 0. Full tension at ~40 degrees
    let tilt = Math.max(0, Math.min(40, gamma));
    manualInputRef.current.torque = tilt / 40.0;
  };

  return (
    <div className="relative w-screen h-[100dvh] bg-stone-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-black flex flex-col items-center justify-center overflow-hidden text-stone-100 selection:bg-blue-500/30">
      {/* Video element for CV processing with visible feedback */}
      <div
        className={`absolute bottom-4 left-4 w-56 bg-stone-900 rounded-lg shadow-2xl border border-stone-800 overflow-hidden z-[100] pointer-events-auto flex flex-col transition-all duration-300 ${inputMethod !== "CAMERA" || !showCameraFeed ? "translate-y-[150%] opacity-0" : "translate-y-0 opacity-100"}`}
      >
        <div className="bg-stone-950 px-3 py-2 text-xs font-bold text-stone-400 flex items-center justify-between border-b border-stone-200">
          <span>Camera Feed</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            <button
              onClick={() => setShowCameraFeed(false)}
              className="text-stone-400 hover:text-stone-300 p-1 rounded-sm hover:bg-stone-200 transition-colors"
              title="Minimize camera"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
        <video
          ref={videoRef}
          className="w-full opacity-60 filter grayscale contrast-125 bg-stone-900"
          playsInline
          muted
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      <div className="relative w-full h-full bg-stone-950 overflow-hidden touch-none">
        {/* MENU SCREEN */}
        {gameState === GameState.MENU && (
          <div className="fixed inset-0 flex flex-col items-center justify-start z-50 bg-[#121212] backdrop-blur-md overflow-y-auto custom-scrollbar w-full h-[100dvh] grid-bg">
            <div className="p-4 md:p-8 max-w-xl w-full flex flex-col items-center justify-center text-center pb-8 md:pb-12 mt-auto mb-auto min-h-full">
              <div className="mb-4 md:mb-8 pt-4">
                <h1 className="text-2xl md:text-3xl font-mono font-bold text-[#e0e0e0] uppercase tracking-[4px] mb-2 flex items-center justify-center gap-4">
                  <svg
                    className="w-8 h-8 text-[#f97316]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  System<span className="text-[#808080]">::</span>Override
                </h1>
                <p className="font-mono text-[11px] text-[#808080] uppercase tracking-[2px]">
                  Internal Mechanics Simulator // Ver 1.4.0
                </p>
              </div>

              <div className="hardware-panel p-6 rounded-xl w-full mb-4 md:mb-8 text-left shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 border-b border-[#333] pb-4">
                  <h3 className="font-mono font-semibold text-xs md:text-xs text-[#e0e0e0] uppercase tracking-widest">
                    <span className="text-[#10b981]">{"//"}</span> Configuration
                  </h3>
                  <button
                    onClick={() => setShowGuide(true)}
                    className="hardware-btn px-4 py-2 flex items-center gap-2"
                  >
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#f97316]">Read Field Guide</span>
                  </button>
                </div>
                <div className="mb-8 flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#808080] uppercase tracking-widest">
                    Mechanism Size: <span className="text-[#e0e0e0]">{pinCount} PINS</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={pinCount}
                    onChange={(e) => setPinCount(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#333] rounded-full appearance-none outline-none border border-[#111]
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:bg-[#f97316] [&::-webkit-slider-thumb]:rounded-[2px] cursor-pointer mt-2 mb-2"
                  />
                  <div className="flex justify-between font-mono text-[9px] text-[#808080] uppercase tracking-widest">
                    <span>1 (Training)</span>
                    <span>7 (Expert)</span>
                  </div>
                </div>
                
                <h3 className="font-mono font-semibold text-xs md:text-xs text-[#e0e0e0] uppercase tracking-widest border-b border-[#333] pb-2 mb-4">
                  <span className="text-[#10b981]">{"//"}</span> Telemetry Source
                </h3>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setInputMethod("MOUSE_KEYBOARD")}
                    className={`hardware-btn p-4 flex items-center justify-start gap-4 transition-colors ${inputMethod === "MOUSE_KEYBOARD" ? "border-solid border-[#f97316]" : ""}`}
                  >
                    <div className={`p-2 rounded border border-[#333] ${inputMethod === "MOUSE_KEYBOARD" ? "bg-[#f97316]/20 text-[#f97316]" : "bg-[#222] text-[#808080]"}`}>
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <div className="text-left flex flex-col items-start leading-tight">
                      <span className="font-mono font-bold text-xs uppercase tracking-widest text-[#e0e0e0] mb-1">
                        Manual Interface
                      </span>
                      <span className="font-mono text-[10px] uppercase text-[#808080] tracking-wider leading-none">
                        Mouse or Touchscreen Control
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setInputMethod("GYRO")}
                    className={`hardware-btn p-4 flex items-center justify-start gap-4 transition-colors ${inputMethod === "GYRO" ? "border-solid border-[#f97316]" : ""}`}
                  >
                    <div className={`p-2 rounded border border-[#333] ${inputMethod === "GYRO" ? "bg-[#f97316]/20 text-[#f97316]" : "bg-[#222] text-[#808080]"}`}>
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left flex flex-col items-start leading-tight">
                      <span className="font-mono font-bold text-xs uppercase tracking-widest text-[#e0e0e0] mb-1">
                        Gyroscope & Touch (Mobile)
                      </span>
                      <span className="font-mono text-[10px] uppercase text-[#808080] tracking-wider leading-none">
                        Tilt device to apply tension. Touch to pick.
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setInputMethod("CAMERA")}
                    className={`hardware-btn p-4 flex items-center justify-start gap-4 transition-colors ${inputMethod === "CAMERA" ? "border-solid border-[#f97316]" : ""}`}
                  >
                    <div className={`p-2 rounded border border-[#333] ${inputMethod === "CAMERA" ? "bg-[#f97316]/20 text-[#f97316]" : "bg-[#222] text-[#808080]"}`}>
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left flex flex-col items-start leading-tight">
                      <span className="font-mono font-bold text-xs uppercase tracking-widest text-[#e0e0e0] mb-1">
                        Optical Tracking
                      </span>
                      <span className="font-mono text-[10px] uppercase text-[#808080] tracking-wider leading-none">
                        Requires Webcam & Physical Lockpick
                      </span>
                    </div>
                  </button>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={async () => {
                      if (inputMethod === "CAMERA") {
                        navigator.mediaDevices
                          .getUserMedia({ video: true })
                          .then((stream) => {
                            setPermissionGranted(true);
                            setGameState(GameState.LOADING);
                            stream.getTracks().forEach((track) => track.stop());
                          })
                          .catch(() => {
                            setPermissionGranted(false);
                            alert("Camera permission is required to use CV functionality.");
                          });
                      } else {
                        setPermissionGranted(true);
                        setGameState(GameState.LOADING);
                      }
                    }}
                    className="hardware-btn px-8 py-4 w-full text-center hover:bg-[#ebf8ff]/5 border-[#f97316]! text-[#f97316]! shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                    style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}
                  >
                    <span className="text-sm font-bold font-mono tracking-[4px] uppercase">
                      Initialize Simulator
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState === GameState.LOADING && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#121212]/90 backdrop-blur-md">
            <div className="flex flex-col items-center justify-center p-8 bg-[#000] border border-[#333] rounded">
              <span className="w-4 h-4 rounded-full bg-[#f97316] animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.6)] mb-4"></span>
              <span className="text-[#f97316] font-mono font-bold text-[10px] tracking-widest uppercase">
                Initializing Telemetry...
              </span>
            </div>
          </div>
        )}

        {gameState === GameState.SUCCESS && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-[#121212]/90 backdrop-blur-md">
            <div className="hardware-panel p-8 max-w-sm w-full text-center flex flex-col items-center">
              <h2 className="text-xl font-mono font-bold text-[#10b981] flex items-center justify-center gap-2 mb-2 uppercase tracking-widest">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Core Reset
              </h2>
              <p className="text-[#808080] mb-8 text-[11px] font-mono tracking-widest uppercase">
                Defeated: {pinCount}-pin cylinder.
              </p>
              <button
                onClick={() => {
                  lockService.reset({
                    pinCount,
                    gravity: 0.8,
                    springConstant: 0.1,
                  });
                  setGameState(GameState.PLAYING);
                }}
                className="hardware-btn border-[#10b981] text-[#10b981] w-full px-6 py-4 uppercase tracking-[2px] font-bold text-[10px] mb-3"
              >
                Reload Scenario
              </button>
              <button
                onClick={() => {
                  setGameState(GameState.MENU);
                }}
                className="hardware-btn w-full px-6 py-4 uppercase tracking-[2px] font-bold text-[10px] text-[#808080]"
              >
                Terminate
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.FAIL && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-[#121212]/90 backdrop-blur-md">
            <div className="hardware-panel p-8 max-w-sm w-full text-center flex flex-col items-center">
              <h2 className="text-xl font-mono font-bold text-[#ef4444] mb-4 uppercase tracking-widest">
                System Error
              </h2>
              <p className="mb-8 text-[10px] font-mono text-[#808080] border border-[#333] bg-[#000] p-4 text-center rounded">
                &gt; SENSOR ACCESS DENIED OR VISION LIBRARIES OFFLINE.<br />
                &gt; CHECK OPTICAL HARDWARE.
              </p>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="hardware-btn px-8 py-3 w-full text-[10px] font-bold uppercase tracking-widest text-[#ef4444]"
                style={{ borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                Reboot System
              </button>
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="w-full h-full relative z-10 touch-none pointer-events-none">
          <GameCanvas
            gameState={lockState}
            currentPick={currentPick}
            viewMode={ViewMode.SPLIT}
          />
        </div>

        {/* UI Overlay for Playing State */}
        {gameState === GameState.PLAYING && (
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20">
            {/* Top Bar HUD */}
            <div className="flex justify-between items-start">
              {/* Left Side: Status */}
              <div className="flex flex-col gap-2 hardware-widget p-3 pointer-events-auto">
                <div className="flex flex-col gap-1 mb-1">
                  <span className="text-[10px] uppercase font-bold text-[#808080] tracking-widest leading-none">
                    Telemetry
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="font-mono text-sm text-[#e0e0e0]">LIVE</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-[#333] pt-2 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#808080] tracking-[2px] leading-none mb-1">
                      Pins
                    </span>
                    <span className="font-mono text-sm text-[#10b981]">
                      {lockState.pins.filter((p) => p.state === PinState.SET).length} / {pinCount}
                    </span>
                  </div>
                </div>
                
                 {lockState.isUnlocked && (
                    <div className="mt-2 pt-2 border-t border-[#333] flex flex-col gap-2 relative">
                      <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest text-center">
                        Lock Defeated
                      </span>
                      <button
                        onClick={() => {
                          lockService.reset({
                            pinCount,
                            ...LEVELS[currentLevelIdx].configOverrides,
                          });
                          setLockState(lockService.getState());
                          audioService.playClick();
                        }}
                        className="hardware-btn px-4 py-1 text-[10px] uppercase tracking-widest font-bold">
                        Reset Core
                      </button>
                    </div>
                  )}
                  {lockState.pins.filter((p) => p.state === PinState.OVERSET).length > 0 && !lockState.isUnlocked && (
                    <div className="mt-2 pt-2 border-t border-[#333] animate-pulse">
                      <span className="text-[10px] font-bold text-[#ef4444] uppercase tracking-widest w-full block text-center bg-[#ef4444]/20 py-1 rounded">
                        OVERSET - DROP TENSION
                      </span>
                    </div>
                  )}
              </div>

              {/* View Mode & Controls (Right) */}
              <div className="flex gap-2 pointer-events-auto items-start">
                <button
                  onClick={() => setShowGuide(true)}
                  className="hardware-btn px-4 py-3 flex items-center shadow-[0_4px_12px_rgba(249,115,22,0.2)] border-[#f97316] text-[#f97316]"
                  style={{ borderColor: '#f97316' }}
                >
                  <span className="text-[10px] uppercase tracking-[2px] font-bold text-[#f97316]">Field Guide</span>
                </button>

                <div className="hardware-widget px-4 py-2 flex flex-col items-center">
                  <label className="text-[9px] font-bold text-[#808080] uppercase tracking-[2px] mb-2">
                    Key Insertion
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={lockState.keyInsertProgress || 0}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const progress = parseFloat(e.target.value);
                      lockService.setKeyProgress(progress);
                      if (progress >= 1.0 && !lockState.isUnlocked) audioService.playOpen();
                    }}
                    className="w-24 h-[6px] bg-[#000] rounded-full appearance-none outline-none border border-[#333] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#e0e0e0] [&::-webkit-slider-thumb]:rounded-[2px] cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => {
                    setGameState(GameState.MENU);
                    audioService.pause();
                  }}
                  className="hardware-btn px-4 py-3 flex items-center">
                   <span className="text-[10px] uppercase tracking-[2px] font-bold text-[#808080]">Exit</span>
                </button>
              </div>
            </div>
            {/* End of Top Bar HUD */}

            {/* Playable HUD Area / Mobile Controls */}
            <div className="absolute bottom-6 inset-x-2 md:inset-x-8 z-50 flex items-end justify-between gap-2 pointer-events-none">
              {/* Interactive Tension Slider */}
              <div
                className="flex flex-col gap-2 w-32 md:w-56 shrink-0 hardware-panel p-3 rounded-xl border border-[#333] shadow-2xl pointer-events-auto"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  // Calculate tension from click position
                  const rect = e.currentTarget.getBoundingClientRect();
                  const val = Math.max(
                    0,
                    Math.min(1, (e.clientX - rect.left) / rect.width),
                  );
                  manualInputRef.current.torque = val;
                }}
                onPointerMove={(e) => {
                  e.stopPropagation();
                  if (
                    (e.buttons > 0 || e.pressure > 0) &&
                    e.currentTarget.hasPointerCapture(e.pointerId)
                  ) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const val = Math.max(
                      0,
                      Math.min(1, (e.clientX - rect.left) / rect.width),
                    );
                    manualInputRef.current.torque = val;
                  }
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  manualInputRef.current.torque = 0;
                }}
                onPointerCancel={(e) => {
                  e.stopPropagation();
                  manualInputRef.current.torque = 0;
                }}
              >
                <div className="flex justify-between items-center text-[10px] text-[#e0e0e0] font-bold font-mono tracking-widest uppercase select-none">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-[#f97316]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    TENSION
                  </span>
                  <span className="text-[#f97316]">{(lockState.totalTorque * 100).toFixed(0)}%</span>
                </div>
                <div className="h-10 md:h-6 w-full bg-[#000] rounded-sm overflow-hidden relative cursor-crosshair border border-[#333] shadow-inner">
                  <div
                    className="h-full bg-[#f97316]/50 transition-none pointer-events-none"
                    style={{ width: `${lockState.totalTorque * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] uppercase font-bold text-[#808080] pointer-events-none tracking-widest text-center">
                    Drag Torque Input
                  </div>
                </div>
              </div>

              {/* Specific Touch Pad for Pick Control */}
              <div
                className={`flex flex-col gap-2 w-48 md:w-64 h-32 md:h-40 shrink-0 hardware-panel p-3 rounded-xl border border-[#333] shadow-2xl pointer-events-auto touch-none relative transition-opacity ${inputMethod === "MOUSE_KEYBOARD" || inputMethod === "GYRO" ? "opacity-100" : "opacity-50"}`}
                onPointerDown={inputMethod !== "CAMERA" ? handlePointerDown : undefined}
                onPointerMove={inputMethod !== "CAMERA" ? handlePointerMove : undefined}
                onPointerUp={inputMethod !== "CAMERA" ? handlePointerUp : undefined}
                onPointerCancel={inputMethod !== "CAMERA" ? handlePointerUp : undefined}
                onPointerLeave={inputMethod !== "CAMERA" ? handlePointerUp : undefined}
              >
                <div className="flex justify-between items-center text-[10px] text-[#e0e0e0] font-bold font-mono tracking-widest uppercase select-none">
                  <span className="flex items-center gap-1 text-[#f97316]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    PICK CONTROL PAD
                  </span>
                </div>
                <div className="w-full flex-1 bg-[#000] rounded-sm border border-[#333] shadow-inner relative overflow-hidden cursor-crosshair">
                   <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-20 pointer-events-none">
                      {Array.from({length: 16}).map((_, i) => (
                        <div key={i} className="border border-[#777]"></div>
                      ))}
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center text-[9px] uppercase font-bold text-[#808080] pointer-events-none tracking-widest text-center">
                    {inputMethod === "CAMERA" ? "Camera Active" : "Drag Here"}
                  </div>
                   {/* Visual indicator of current pick position on touch pad */}
                   <div 
                      className="absolute w-3 h-3 border border-[#f97316] bg-[#f97316]/20 rounded-full translate-x-[-50%] translate-y-[-50%] pointer-events-none transition-all duration-75"
                      style={{
                        left: `${(lockState.pickPosition.x - 150) / 400 * 100}%`,
                        top: `${(lockState.pickPosition.y - 150) / 200 * 100}%`
                      }}
                   ></div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
      {showGuide && <GuideOverlay onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default App;
