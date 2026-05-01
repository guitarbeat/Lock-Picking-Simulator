import { DIMENSIONS } from "../constants";
import { LockState, PickTool } from "../types";
import { drawPinStack } from "./canvasHelpers";

export const renderFrontView = (
  ctx: CanvasRenderingContext2D,
  time: number,
  gameState: LockState,
  currentPick: PickTool
) => {
  const cx = 400;
  const cy = 300;
  const outerRadius = 150;
  const innerRadius = 80;

  // Housing Base - Brushed Steel ring + Bible
  ctx.beginPath();
  // Bible (top rectangle part of the lock housing)
  ctx.roundRect(cx - 40, cy - outerRadius - 50, 80, outerRadius + 50, 10);
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 20;

  const hGrad = ctx.createLinearGradient(
    cx - outerRadius,
    cy - outerRadius - 50,
    cx + outerRadius,
    cy + outerRadius,
  );
  hGrad.addColorStop(0.0, "#78716c");
  hGrad.addColorStop(0.2, "#d6d3d1");
  hGrad.addColorStop(0.5, "#78716c");
  hGrad.addColorStop(0.9, "#44403c");
  hGrad.addColorStop(1.0, "#292524");

  ctx.fillStyle = hGrad;
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Inner bevel for housing
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius - 4, 0, Math.PI * 2);
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Plug (Brass)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((gameState.coreRotation * Math.PI) / 180);

  ctx.beginPath();
  ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);

  // Deep dark ring around the plug (shear line)
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 8;
  ctx.stroke();

  const goldGrad = ctx.createRadialGradient(
    0,
    -innerRadius / 2,
    10,
    0,
    0,
    innerRadius,
  );
  goldGrad.addColorStop(0, "#fef08a");
  goldGrad.addColorStop(0.5, "#eab308");
  goldGrad.addColorStop(1, "#854d0e");
  ctx.fillStyle = goldGrad;
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Keyway
  ctx.fillStyle = "#0a0a0a"; 
  ctx.beginPath();
  const kw = 2.2; // Keyway width scale
  ctx.moveTo(-10 * kw, -26);
  ctx.lineTo(10 * kw, -26);
  ctx.lineTo(10 * kw, -10);
  ctx.lineTo(20 * kw, 0);
  ctx.lineTo(20 * kw, 15);
  ctx.lineTo(10 * kw, 25);
  ctx.lineTo(20 * kw, 35);
  ctx.lineTo(10 * kw, 53);
  ctx.lineTo(-10 * kw, 53);
  ctx.lineTo(0 * kw, 35);
  ctx.lineTo(-10 * kw, 25);
  ctx.lineTo(0 * kw, 15);
  ctx.lineTo(-10 * kw, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.8)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw Tension Wrench if torque > 0
  if (gameState.totalTorque > 0) {
    ctx.fillStyle = "#78716c"; 
    ctx.beginPath();
    ctx.rect(-8 * kw, 40, 16 * kw, 13);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(8 * kw, 40, 20 * kw, 200);
    ctx.fill();
    ctx.stroke();
  }

  // Draw Pick Cross-section
  if (gameState.isKeyInserted) {
    ctx.fillStyle = "#737373";
    ctx.fillRect(-8 * kw, 5, 16 * kw, 48); 
    ctx.strokeStyle = "#404040";
    ctx.strokeRect(-8 * kw, 5, 16 * kw, 48);
  } else {
    const sideViewY = gameState.pickPosition.y;
    const relativeY = (sideViewY - 230) * (80 / 30);

    ctx.fillStyle = "#e2e8f0"; // bright metal
    ctx.fillRect(-2 * kw, relativeY, 4 * kw, 150); // shaft

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-1 * kw, relativeY, 1 * kw, 150);

    ctx.strokeStyle = "#334155";
    ctx.strokeRect(-2 * kw, relativeY, 4 * kw, 150);
  }

  ctx.restore();

  // Draw all pins from back to front with slight darkening for depth
  for (let i = gameState.pins.length - 1; i >= 0; i--) {
    const pin = gameState.pins[i];
    ctx.save();
    ctx.translate(cx, cy - innerRadius); // top of plug (shear line)
    ctx.scale(80 / 30, 80 / 30); // match side-view scale
    
    // Clip the pins so they don't stick out of the housing
    ctx.beginPath();
    const scaledHousingDistance = (outerRadius - innerRadius + 50) * (30 / 80);
    ctx.rect(
      -DIMENSIONS.pinWidth / 2 - 4,
      -scaledHousingDistance,
      DIMENSIONS.pinWidth + 8,
      scaledHousingDistance + 100 // extend down enough for key pins
    );
    ctx.clip();

    drawPinStack(
      ctx,
      -DIMENSIONS.pinWidth / 2, // centered horizontally
      0, // shear line is at 0 in scaled space
      pin,
      time,
    );
    
    // Add depth shadow to pins behind
    if (i > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.4 + i * 0.1})`; // Darken pins further back
      ctx.fillRect(-DIMENSIONS.pinWidth / 2, -150, DIMENSIONS.pinWidth, 300);
    }
    
    ctx.restore();
  }
};
