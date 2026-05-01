import { DIMENSIONS } from "../constants";
import { Pin, PinState, PickShape } from "../types";

export const drawLabel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string,
  isPulsing: boolean,
  isUrgent: boolean = false
) => {
  ctx.save();

  let scale = 1;
  let alpha = 1;
  if (isPulsing) {
    if (isUrgent) {
      const pulse = (Math.sin(Date.now() / 50) + 1) / 2; // Faster, sharper pulse
      scale = 1 + pulse * 0.2;
      alpha = 0.5 + pulse * 0.5;
    } else {
      const pulse = (Math.sin(Date.now() / 150) + 1) / 2; // 0 to 1
      scale = 1 + pulse * 0.15;
    }
  }

  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.font = "bold 11px sans-serif";
  const metrics = ctx.measureText(text);
  const w = metrics.width;
  const h = 14;
  const paddingX = 6;
  const paddingY = 4;

  // Outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(
    -w / 2 - paddingX,
    -h / 2 - paddingY,
    w + paddingX * 2,
    h + paddingY * 2,
    4,
  );
  ctx.fill();

  ctx.shadowBlur = 0; // Reset shadow for text

  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 1);

  ctx.restore();
};

export const drawPickHead = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: PickShape,
) => {
  ctx.save();
  ctx.beginPath();

  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x, y + 12, x - 15, y + 15);
  ctx.lineTo(x - 300, y + 15);
  ctx.lineTo(x - 300, y + 22);
  ctx.lineTo(x - 20, y + 22);
  ctx.quadraticCurveTo(x - 2, y + 22, x, y + 8);
  ctx.lineTo(x, y);
  ctx.closePath();

  // Metallic horizontal gradient for the pick
  const grad = ctx.createLinearGradient(0, y - 5, 0, y + 25);
  grad.addColorStop(0, "#52525b");
  grad.addColorStop(0.3, "#fdfcfb"); // Shiny top edge
  grad.addColorStop(0.6, "#a1a1aa");
  grad.addColorStop(0.8, "#52525b");
  grad.addColorStop(1, "#27272a"); // Dark bottom edge

  // Shadow for pick to show depth
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#27272a";
  ctx.stroke();

  ctx.restore();
  return { x: x - 20, y: y + 20 };
};

export const drawPinStack = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pin: Pin,
  time: number,
) => {
  let visualOffsetY = 0;
  if (pin.state === PinState.RESTING && pin.currentLift < 0.05) {
    const t = time * 0.002;
    const phase = pin.id * 1337;
    visualOffsetY = (Math.sin(t + phase) + Math.sin(t * 1.5 + phase)) * 0.5; // subtle breathing
  }

  const liftPx = pin.currentLift * DIMENSIONS.pinMaxLift - visualOffsetY;
  const padding = 2;
  const w = DIMENSIONS.pinWidth;

  // y is the shear line. Keyway floor is 50.
  const KEYWAY_FLOOR = 50;
  // The base of the key pin WITHOUT lift is at y + KEYWAY_FLOOR.
  const baseKeyY = y + KEYWAY_FLOOR - pin.keyPinHeight;
  const keyY = baseKeyY - liftPx;
  const driverY = keyY - pin.driverPinHeight;

  // --- SPRING ---
  const springTopY = y - 100;
  const driverTopY = driverY;
  const springHeight = Math.max(0, driverTopY - springTopY);

  ctx.strokeStyle = "#b87754"; // copper color
  ctx.lineWidth = 1;
  ctx.beginPath();
  const coilSpacing = 4;
  const coils = Math.max(3, Math.floor(springHeight / coilSpacing));
  const coilHeight = springHeight / coils;

  ctx.moveTo(x + 2, springTopY);
  if (springHeight > 5) {
    for (let i = 0; i < coils; i++) {
      const cy = springTopY + i * coilHeight;
      ctx.lineTo(x + w - 2, cy + coilHeight * 0.5);
      ctx.lineTo(x + 2, cy + coilHeight);
    }
  } else {
    ctx.lineTo(x + w - 2, springTopY + springHeight);
  }
  ctx.stroke();

  ctx.lineWidth = 1;

  // --- DRIVER PIN ---
  ctx.strokeStyle = "#0f172a"; // steel outline
  const driverGrad = ctx.createLinearGradient(x, 0, x + w, 0);
  driverGrad.addColorStop(0, "#64748b"); // steel
  driverGrad.addColorStop(0.3, "#cbd5e1"); // highlight
  driverGrad.addColorStop(1, "#334155");

  ctx.fillStyle = driverGrad;

  // Add visual feedback glow based on state
  ctx.save();
  if (pin.state === PinState.SET) {
    ctx.shadowColor = "rgba(16, 185, 129, 0.8)"; // Green
    ctx.shadowBlur = 12;
  } else if (pin.state === PinState.BINDING) {
    const pulse = (Math.sin(time * 0.01) + 1) / 2;
    ctx.shadowColor = `rgba(245, 158, 11, ${0.4 + pulse * 0.4})`; // Pulsing orange
    ctx.shadowBlur = 15;
  } else if (pin.state === PinState.FALSE_SET) {
    ctx.shadowColor = "rgba(147, 51, 234, 0.8)"; // Purple
    ctx.shadowBlur = 12;
  } else if (pin.state === PinState.OVERSET) {
    const urgentPulse = (Math.sin(time * 0.03) + 1) / 2;
    ctx.shadowColor = `rgba(239, 68, 68, ${0.5 + urgentPulse * 0.5})`; // Fast pulsing red
    ctx.shadowBlur = 15 + urgentPulse * 15;
  }

  const cornerRadius = 2;
  ctx.beginPath();
  
  if (pin.type === "SPOOL") {
    ctx.moveTo(x + cornerRadius, driverY);
    ctx.lineTo(x + w - cornerRadius, driverY);
    ctx.quadraticCurveTo(x + w, driverY, x + w, driverY + cornerRadius);
    ctx.lineTo(x + w, driverY + 8);
    ctx.lineTo(x + w - 4, driverY + 12); // slope in
    ctx.lineTo(x + w - 4, driverY + pin.driverPinHeight - 12);
    ctx.lineTo(x + w, driverY + pin.driverPinHeight - 8); // slope out
    ctx.lineTo(x + w, driverY + pin.driverPinHeight - cornerRadius);
    ctx.quadraticCurveTo(
      x + w,
      driverY + pin.driverPinHeight,
      x + w - cornerRadius,
      driverY + pin.driverPinHeight,
    );
    ctx.lineTo(x + cornerRadius, driverY + pin.driverPinHeight);
    ctx.quadraticCurveTo(
      x,
      driverY + pin.driverPinHeight,
      x,
      driverY + pin.driverPinHeight - cornerRadius,
    );
    ctx.lineTo(x, driverY + pin.driverPinHeight - 8);
    ctx.lineTo(x + 4, driverY + pin.driverPinHeight - 12);
    ctx.lineTo(x + 4, driverY + 12);
    ctx.lineTo(x, driverY + 8);
    ctx.lineTo(x, driverY + cornerRadius);
    ctx.quadraticCurveTo(x, driverY, x + cornerRadius, driverY);
  } else if (pin.type === "SERRATED") {
    ctx.moveTo(x + cornerRadius, driverY);
    ctx.lineTo(x + w - cornerRadius, driverY);
    ctx.quadraticCurveTo(x + w, driverY, x + w, driverY + cornerRadius);
    let y = driverY + cornerRadius;
    const serrations = 3;
    const step = pin.driverPinHeight / (serrations + 1);
    for (let i = 0; i < serrations; i++) {
      y += step - 3;
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - 3, y + 1.5);
      ctx.lineTo(x + w, y + 3);
      y += 3;
    }
    ctx.lineTo(x + w, driverY + pin.driverPinHeight - cornerRadius);
    ctx.quadraticCurveTo(
      x + w,
      driverY + pin.driverPinHeight,
      x + w - cornerRadius,
      driverY + pin.driverPinHeight,
    );
    ctx.lineTo(x + cornerRadius, driverY + pin.driverPinHeight);
    ctx.quadraticCurveTo(
      x,
      driverY + pin.driverPinHeight,
      x,
      driverY + pin.driverPinHeight - cornerRadius,
    );
    y = driverY + pin.driverPinHeight - cornerRadius;
    for (let i = 0; i < serrations; i++) {
      y -= step - 3;
      ctx.lineTo(x, y);
      ctx.lineTo(x + 3, y - 1.5);
      ctx.lineTo(x, y - 3);
      y -= 3;
    }
    ctx.lineTo(x, driverY + cornerRadius);
    ctx.quadraticCurveTo(x, driverY, x + cornerRadius, driverY);
  } else {
    ctx.moveTo(x + cornerRadius, driverY);
    ctx.lineTo(x + w - cornerRadius, driverY);
    ctx.quadraticCurveTo(x + w, driverY, x + w, driverY + cornerRadius);
    ctx.lineTo(x + w, driverY + pin.driverPinHeight - cornerRadius);
    ctx.quadraticCurveTo(
      x + w,
      driverY + pin.driverPinHeight,
      x + w - cornerRadius,
      driverY + pin.driverPinHeight,
    );
    ctx.lineTo(x + cornerRadius, driverY + pin.driverPinHeight);
    ctx.quadraticCurveTo(
      x,
      driverY + pin.driverPinHeight,
      x,
      driverY + pin.driverPinHeight - cornerRadius,
    );
    ctx.lineTo(x, driverY + cornerRadius);
    ctx.quadraticCurveTo(x, driverY, x + cornerRadius, driverY);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore(); // Restore shadow

  // --- KEY PIN ---
  ctx.save();
  let keyOutline = "#422006";
  if (pin.state === PinState.OVERSET) {
    const flash = (Math.sin(time * 0.03) + 1) / 2;
    keyOutline = `rgba(239, 68, 68, ${0.7 + flash * 0.3})`;
    ctx.shadowColor = `rgba(239, 68, 68, ${0.5 + flash * 0.5})`;
    ctx.shadowBlur = 10 + flash * 10;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }
  ctx.strokeStyle = keyOutline; // dark brass outline or red warning

  const keyGrad = ctx.createLinearGradient(x, 0, x + w, 0);
  keyGrad.addColorStop(0, "#b48325"); // dark brass
  keyGrad.addColorStop(0.3, "#fde047"); // bright brass
  keyGrad.addColorStop(1, "#854d0e");

  ctx.fillStyle = keyGrad;
  ctx.beginPath();
  ctx.moveTo(x + cornerRadius, keyY); // Top flat
  ctx.lineTo(x + w - cornerRadius, keyY);
  ctx.quadraticCurveTo(x + w, keyY, x + w, keyY + cornerRadius);

  // Go down to the tip
  ctx.lineTo(x + w, keyY + pin.keyPinHeight - 8);
  // Tip angle
  ctx.lineTo(x + w / 2, keyY + pin.keyPinHeight); // Pointed tip
  ctx.lineTo(x, keyY + pin.keyPinHeight - 8);

  ctx.lineTo(x, keyY + cornerRadius);
  ctx.quadraticCurveTo(x, keyY, x + cornerRadius, keyY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore(); // Restore shadow again if we manipulated it

  // Feedback Bursts
  if (pin.state === PinState.SET) {
    drawLabel(ctx, x + w / 2, keyY + 20, "SET ✓", "#10b981", false);
  } else if (pin.state === PinState.BINDING) {
    drawLabel(ctx, x + w / 2, keyY + 20, "BINDING", "#f97316", true);
  } else if (pin.state === PinState.FALSE_SET) {
    drawLabel(ctx, x + w / 2, keyY + 20, "FALSE SET", "#a855f7", false);
  } else if (pin.state === PinState.OVERSET) {
    drawLabel(ctx, x + w / 2, keyY + 20, "OVERSET x", "#ef4444", true, true);
  }
};

export const drawTorqueWrench = (
  ctx: CanvasRenderingContext2D,
  torque: number,
  lockX: number,
  lockY: number,
) => {
  ctx.save();
  // In side view, wrench is inserted at the front of the plug (lockX)
  // inserted into the bottom of the keyway
  const wrenchX = lockX;
  const wrenchY = lockY + 50; // bottom of the keyway

  ctx.translate(wrenchX, wrenchY);

  // Apply torque visually: the handle bends or twists slightly
  // Torque pushes it inwards or outwards in perspective, let's just rotate slightly
  ctx.rotate(torque * 0.05);

  const wrenchGrad = ctx.createLinearGradient(0, 0, 0, 10);
  wrenchGrad.addColorStop(0, "#78716c");
  wrenchGrad.addColorStop(0.5, "#a8a29e");
  wrenchGrad.addColorStop(1, "#78716c");

  ctx.fillStyle = wrenchGrad;
  ctx.strokeStyle = "#292524";
  ctx.lineWidth = 1;

  ctx.beginPath();
  // Inserted part prong (horizontal into the lock, to the right)
  ctx.rect(0, 0, 60, 10); 
  // Handle part hanging down (vertical)
  ctx.rect(-10, 0, 10, 150); 
  ctx.fill();
  ctx.stroke();

  if (torque > 0) {
    // Draw tension arrow beside the handle
    const arrowLength = 20 + torque * 60;
    ctx.strokeStyle = "#ef4444";
    ctx.fillStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Arrow pointing right
    ctx.moveTo(-15, 80 - arrowLength / 2);
    ctx.lineTo(-15, 80 + arrowLength / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-20, 80 + arrowLength / 2 - 5);
    ctx.lineTo(-10, 80 + arrowLength / 2 - 5);
    ctx.lineTo(-15, 80 + arrowLength / 2 + 5);
    ctx.fill();
  }

  ctx.restore();
};

export const drawKey = (
  ctx: CanvasRenderingContext2D,
  lockX: number,
  lockY: number,
  pins: Pin[],
  progress: number = 1.0
) => {
  ctx.save();

  const keyWidth = DIMENSIONS.lockWidth + 40;
  
  // progress = 0: key is right outside. progress = 1: fully inserted.
  const startX = lockX - keyWidth - 80;
  const endX = lockX - 40;
  
  const keyX = startX + (endX - startX) * Math.max(0, Math.min(1, progress));
  const keyBottomY = lockY + 55;
  const keyTopY = lockY + 15;

  // Create realistic metallic gradient
  const keyGrad = ctx.createLinearGradient(0, keyTopY, 0, keyBottomY);
  keyGrad.addColorStop(0, "#d4d4d8");
  keyGrad.addColorStop(0.2, "#f4f4f5"); // edge reflection
  keyGrad.addColorStop(0.5, "#a1a1aa");
  keyGrad.addColorStop(0.8, "#52525b");
  keyGrad.addColorStop(1, "#3f3f46");

  ctx.fillStyle = keyGrad;
  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";

  ctx.beginPath();
  // Bottom left of blade
  ctx.moveTo(keyX, keyBottomY); 
  // Bottom edge of blade (straight) to the tip
  ctx.lineTo(keyX + keyWidth - 10, keyBottomY); 
  // Angled tip
  ctx.lineTo(keyX + keyWidth + 5, keyBottomY - 15);
  ctx.lineTo(keyX + keyWidth + 5, keyTopY + 10);

  // Draw the bitting (cuts) from right to left
  for (let i = pins.length - 1; i >= 0; i--) {
    const pin = pins[i];
    // The cut is mapped relative to the key head.
    const cutCenterX = keyX + 40 + 30 + i * DIMENSIONS.pinSpacing;
    // Cut Y is based on pin.keyPinHeight, deeper cuts have larger keyPinHeight
    // Minimum Y should be capped so it doesn't go below the key blade
    const cutY = Math.min(keyBottomY - 10, lockY + pin.keyPinHeight + 2);

    // Bitting profile: steep drop on left, gradual ramp on right (to lift pins on insert)
    ctx.lineTo(cutCenterX + 16, keyTopY); // Right shoulder (flat)
    ctx.lineTo(cutCenterX + 4, cutY); // Slant down
    ctx.lineTo(cutCenterX - 4, cutY); // Bottom of cut (flat)
    ctx.lineTo(cutCenterX - 12, keyTopY); // Slant back up
  }

  // Connect to the key head/bow
  ctx.lineTo(keyX, keyTopY);

  // Draw Key Head (Bow) - A nicer shape (e.g. rounded diamond/octagon)
  ctx.lineTo(keyX, keyTopY - 20);
  ctx.quadraticCurveTo(keyX, keyTopY - 30, keyX - 10, keyTopY - 30);
  
  // Top of bow
  ctx.lineTo(keyX - 60, keyTopY - 30);
  ctx.quadraticCurveTo(keyX - 80, keyTopY - 30, keyX - 80, keyTopY - 10);
  
  // Left edge of bow
  ctx.lineTo(keyX - 80, keyBottomY + 10);
  ctx.quadraticCurveTo(keyX - 80, keyBottomY + 30, keyX - 60, keyBottomY + 30);
  
  // Bottom of bow
  ctx.lineTo(keyX - 10, keyBottomY + 30);
  ctx.quadraticCurveTo(keyX, keyBottomY + 30, keyX, keyBottomY + 20);

  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  // Warding groove 1
  ctx.beginPath();
  ctx.moveTo(keyX - 5, lockY + 32);
  ctx.lineTo(keyX + keyWidth, lockY + 32);
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Warding groove 2 (highlight)
  ctx.beginPath();
  ctx.moveTo(keyX - 5, lockY + 35);
  ctx.lineTo(keyX + keyWidth, lockY + 35);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Warding groove 3 (bottom)
  ctx.beginPath();
  ctx.moveTo(keyX - 5, lockY + 45);
  ctx.lineTo(keyX + keyWidth - 5, lockY + 45);
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Add hole in key bow
  ctx.beginPath();
  ctx.arc(keyX - 60, lockY + 35, 10, 0, Math.PI * 2);
  // Erase the hole (punch through using globalCompositeOperation or fill with bg color)
  ctx.fillStyle = "#fafaf9"; // stone-50 to match bg
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.stroke();
  
  // Add inner shadow to hole
  ctx.beginPath();
  ctx.arc(keyX - 60, lockY + 35, 10, 0, Math.PI);
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
};
