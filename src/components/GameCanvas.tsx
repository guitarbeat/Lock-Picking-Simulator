import React, { useRef, useEffect } from "react";
import { LockState, PickTool, ViewMode } from "../types";
import { renderFrontView } from "../renderers/renderFrontView";
import { renderSideView } from "../renderers/renderSideView";
import { renderTopView } from "../renderers/renderTopView";

interface GameCanvasProps {
  gameState: LockState;
  currentPick: PickTool;
  viewMode?: ViewMode;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  currentPick,
  viewMode = ViewMode.SIDE,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sideCanvasRef = useRef<HTMLCanvasElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const topCanvasRef = useRef<HTMLCanvasElement>(null);

  const render = (time: number) => {
    if (viewMode === ViewMode.SPLIT) {
      if (topCanvasRef.current) {
        const ctx = topCanvasRef.current.getContext("2d");
        if (ctx) renderTopView(ctx, time, gameState);
      }
      if (sideCanvasRef.current) {
        const ctx = sideCanvasRef.current.getContext("2d");
        if (ctx) renderSideView(ctx, time, gameState, currentPick);
      }
      if (frontCanvasRef.current) {
        const ctx = frontCanvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, 800, 600);
          renderFrontView(ctx, time, gameState, currentPick);
        }
      }
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (viewMode === ViewMode.FRONT) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderFrontView(ctx, time, gameState, currentPick);
      } else if (viewMode === ViewMode.TOP) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderTopView(ctx, time, gameState);
      } else {
        renderSideView(ctx, time, gameState, currentPick);
      }
    }
  };

  useEffect(() => {
    let animationFrameId: number;
    const loop = (time: number) => {
      render(time);
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, currentPick, viewMode]);

  return (
    <div className="relative w-full h-full bg-[#121212] overflow-hidden grid-bg">
      {/* SPLIT VIEW RENDER */}
      {viewMode === ViewMode.SPLIT && (
        <div className="absolute inset-x-[5%] inset-y-[100px] flex flex-col md:flex-row gap-4">
          <div className="flex-1 min-h-0 min-w-0 relative hardware-panel overflow-hidden flex flex-col">
            <canvas
              ref={topCanvasRef}
              width={800}
              height={300}
              className="w-full h-1/3 object-contain border-b border-[#222]"
            />
            <canvas
              ref={sideCanvasRef}
              width={800}
              height={600}
              className="w-full h-2/3 object-contain"
            />
            <div className="absolute top-2 left-3 font-mono text-[10px] hardware-text-secondary uppercase tracking-[2px] pointer-events-none">Internal View // YZ-PLANE</div>
          </div>
          
          <div className="flex-1 md:flex-none md:w-[400px] min-h-0 relative hardware-panel overflow-hidden flex flex-col justify-center items-center">
            <canvas
              ref={frontCanvasRef}
              width={600}
              height={600}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-3 font-mono text-[10px] hardware-text-secondary uppercase tracking-[2px] pointer-events-none">Feedback // XZ-PLANE</div>
            
            {/* Overlay hint */}
            <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none pointer-events-none opacity-50">
               <span className="font-mono text-[10px] uppercase hardware-text-secondary border border-[#333] bg-[#000] px-2 py-1 rounded">Interactive Area</span>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE VIEW RENDER */}
      {viewMode !== ViewMode.SPLIT && (
        <div className="absolute inset-0 pt-[110px] pb-[160px] md:pt-[80px] md:pb-[220px] flex flex-col justify-center items-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full object-contain relative z-10"
          />
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
