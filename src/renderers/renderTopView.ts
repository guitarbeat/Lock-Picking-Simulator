import { DIMENSIONS } from "../constants";
import { LockState, PinState } from "../types";
import { drawLabel } from "./canvasHelpers";

export const renderTopView = (
  ctx: CanvasRenderingContext2D,
  time: number,
  gameState: LockState
) => {
  // Clear transparent
  ctx.clearRect(0, 0, 800, 300);

  const lockX = 200;
  const lockY = 150;
  const plugCenterY = lockY; 
  
  // Outer Housing Base - brushed steel
  const lockW = DIMENSIONS.lockWidth + 40;
  const lockH = 90;
  
  const hGrad = ctx.createLinearGradient(0, plugCenterY - 45, 0, plugCenterY + 45);
  hGrad.addColorStop(0.0, "#78716c");
  hGrad.addColorStop(0.2, "#d6d3d1");
  hGrad.addColorStop(0.5, "#78716c");
  hGrad.addColorStop(0.9, "#44403c");
  hGrad.addColorStop(1.0, "#292524");
  
  ctx.fillStyle = hGrad;
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;

  ctx.beginPath();
  ctx.roundRect(lockX - 20, plugCenterY - 45, lockW, lockH, 12);
  ctx.fill();

  ctx.shadowColor = "transparent";

  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 1;
  ctx.strokeRect(lockX - 20, plugCenterY - 45, lockW, lockH);

  // Plug (Core)
  const goldGrad = ctx.createLinearGradient(0, plugCenterY - 18, 0, plugCenterY + 18);
  goldGrad.addColorStop(0, "#854d0e");
  goldGrad.addColorStop(0.2, "#fde047");
  goldGrad.addColorStop(0.5, "#eab308");
  goldGrad.addColorStop(0.8, "#854d0e");
  goldGrad.addColorStop(1, "#422006");

  ctx.fillStyle = goldGrad;
  ctx.fillRect(lockX, plugCenterY - 18, DIMENSIONS.lockWidth, 36);
  
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 2;
  ctx.strokeRect(lockX, plugCenterY - 18, DIMENSIONS.lockWidth, 36);

  // Pin chambers (holes) viewed from top
  for (let i = 0; i < gameState.pins.length; i++) {
      const pin = gameState.pins[i];
      const pinX = lockX + 30 + i * DIMENSIONS.pinSpacing;
      const pinCenterX = pinX + DIMENSIONS.pinWidth / 2;

      ctx.beginPath();
      ctx.arc(pinCenterX, plugCenterY, DIMENSIONS.pinWidth / 2 + 2, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0a0a'; // dark hole
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      const liftPx = pin.currentLift * DIMENSIONS.pinMaxLift;
      const scale = 1 + (liftPx / 50) * 0.2;

      ctx.save();
      ctx.translate(pinCenterX, plugCenterY);
      ctx.scale(scale, scale);

      const fillGrad = ctx.createRadialGradient(-2, -2, 0, 0, 0, DIMENSIONS.pinWidth / 2);
      fillGrad.addColorStop(0, '#cbd5e1');
      fillGrad.addColorStop(1, '#334155');
      ctx.fillStyle = fillGrad;
      
      ctx.beginPath();
      ctx.arc(0, 0, DIMENSIONS.pinWidth / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
      
      if (pin.state === PinState.SET) {
          drawLabel(ctx, pinCenterX, plugCenterY - 60, "SET", "#059669", false);
      } else if (pin.state === PinState.OVERSET) {
          drawLabel(ctx, pinCenterX, plugCenterY - 60, "OVER", "#dc2626", true);
      }
  }

  // Key sliding in from top view
  if (gameState.isKeyInserted) {
    const keyWidth = DIMENSIONS.lockWidth + 40;
    const progress = gameState.keyInsertProgress || 0;
    const startX = lockX - keyWidth - 80;
    const endX = lockX - 40;
    const keyX = startX + (endX - startX) * Math.max(0, Math.min(1, progress));
    
    // Draw key spine from top
    ctx.fillStyle = "#a1a1aa";
    ctx.fillRect(keyX, plugCenterY - 2, keyWidth, 4);
    
    // Key bow from top
    ctx.fillStyle = "#52525b";
    ctx.fillRect(keyX - 60, plugCenterY - 4, 60, 8);
  } else {
    // Pick shaft from top
    const pickX = gameState.pickPosition.x;
    const pickYOffset = (gameState.pickPosition.y - 200) * 0.1; 
    
    ctx.fillStyle = "#e2e8f0"; // bright metal
    ctx.fillRect(pickX - 300, plugCenterY - 1 + pickYOffset, 300, 2); 
    
    // Pick tip highlight from top
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(pickX - 10, plugCenterY - 1 + pickYOffset, 10, 2);

    // Tension Wrench from top view
    if (gameState.totalTorque > 0) {
      ctx.save();
      ctx.translate(lockX, plugCenterY + 15);
      ctx.rotate(gameState.totalTorque * 0.05); // slight bend
      
      // Handle coming towards bottom of screen
      ctx.fillStyle = "#78716c";
      ctx.fillRect(-10, 0, 10, 100);
      ctx.strokeStyle = "#44403c";
      ctx.strokeRect(-10, 0, 10, 100);
      
      ctx.restore();
    }
  }
};
