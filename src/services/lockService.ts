import {
  LockState,
  Pin,
  PinState,
  PinType,
  HandInput,
  GameConfig,
  Vector2,
  PickShape,
} from "../types";
import { CONFIG, DIMENSIONS } from "../constants";
import { audioService } from "./audioService";

export class LockService {
  private config: GameConfig;
  private state: LockState;
  private lastTouchedPinId: number = -1;
  private unlockAnimationTime: number = 0;

  constructor() {
    this.config = { ...CONFIG };
    this.state = this.createInitialState(this.config.pinCount);
  }

  private createInitialState(pinCount: number): LockState {
    const pins: Pin[] = [];
    // Generate pins
    for (let i = 0; i < pinCount; i++) {
      // Key pins should range up to 45 so they don't surpass the shear line at rest.
      // Maximum pinLift is 50 in constants.ts. If keyHeight > 50, it goes past the shear line initially.
      const keyHeight = 15 + Math.random() * 30; // 15 to 45
      const driverHeight = 20 + Math.random() * 15; // 20 to 35

      let type = PinType.NORMAL;
      if (this.config.pinCount > 3) {
        // More than 3 pins implies higher difficulty (or we can inject later via config)
        const rand = Math.random();
        if (rand > 0.8) type = PinType.SPOORATED;
        else if (rand > 0.6) type = PinType.SERRATED;
        else if (rand > 0.3) type = PinType.SPOOL;
      }

      pins.push({
        id: i,
        keyPinHeight: keyHeight,
        driverPinHeight: driverHeight,
        springForce: this.config.springConstant + Math.random() * 0.05, // Slight variance
        bindingThreshold: 0, // Assigned later
        type: type,
        currentLift: 0,
        velocity: 0, // Positive = falling down, Negative = moving up
        state: PinState.RESTING,
        color: "#fbbf24",
      });
    }

    // Determine binding order
    const indices = Array.from({ length: pinCount }, (_, i) => i);
    const bindingOrder = this.shuffleArray(indices);

    return {
      pins,
      bindingOrder,
      currentBindingIndex: bindingOrder[0],
      coreRotation: 0,
      totalTorque: 0,
      pickPosition: { x: 0, y: 0 },
      isUnlocked: false,
      shackleOffset: 0,
    };
  }

  private shuffleArray(array: number[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  public getState(): LockState {
    return this.state;
  }

  public reset(configOverride?: Partial<GameConfig>) {
    if (configOverride) {
      this.config = { ...CONFIG, ...configOverride };
    }
    this.state = this.createInitialState(this.config.pinCount);
    this.lastTouchedPinId = -1;
    this.unlockAnimationTime = 0;
  }

  public unlock() {
    if (!this.state.isUnlocked) {
      this.state.isUnlocked = true;
      this.unlockAnimationTime = 0;
    }
  }

  public setKeyProgress(progress: number) {
    this.state.keyInsertProgress = progress;
    this.state.isKeyInserted = progress > 0;

    if (progress <= 0) {
      if (!this.state.isUnlocked) {
        this.resetPins();
      }
      return;
    }

    const PROGRESS_MAX = this.state.pins.length * DIMENSIONS.pinSpacing + 80;
    const progressX = progress * PROGRESS_MAX;

    this.state.pins.forEach((pin, i) => {
      const pinX = 30 + i * DIMENSIONS.pinSpacing;

      if (progressX < pinX) {
        pin.currentLift = 0;
        pin.state = PinState.RESTING;
        return;
      }

      const distFromTip = progressX - pinX;
      let profileLift = 1.0;

      if (distFromTip < 15) {
        profileLift = Math.min(1.0, distFromTip / 15);
      }

      // Check all bitting cuts to carve out the notches
      for (let j = 0; j < this.state.pins.length; j++) {
        const cutDistFromTip = PROGRESS_MAX - (30 + j * DIMENSIONS.pinSpacing);
        const setPoint = 1.0 - this.state.pins[j].keyPinHeight / 50;
        const localX = distFromTip - cutDistFromTip;

        // localX > 0 means closer to key bow, localX < 0 means closer to key tip
        if (localX >= -4 && localX <= 4) {
          profileLift = Math.min(profileLift, setPoint);
        } else if (localX > 4 && localX <= 16) {
          const p = (localX - 4) / 12;
          const rampLift = setPoint + (1.0 - setPoint) * p;
          profileLift = Math.min(profileLift, rampLift);
        } else if (localX < -4 && localX >= -12) {
          const p = Math.abs(localX + 4) / 8;
          const rampLift = setPoint + (1.0 - setPoint) * p;
          profileLift = Math.min(profileLift, rampLift);
        }
      }

      // If fully inserted, snap exactly to prevent precision floating issues causing overset state visually
      if (progress >= 1.0) {
        pin.currentLift = 1.0 - pin.keyPinHeight / 50;
        pin.state = PinState.SET;
      } else {
        pin.currentLift = profileLift;
        pin.state = PinState.RESTING;
      }
    });

    if (progress >= 1.0 && !this.state.isUnlocked) {
      this.state.totalTorque = 1.0;
      this.unlock();
    }
  }

  private resetPins() {
    this.state.pins.forEach((p) => {
      p.currentLift = 0;
      p.state = PinState.RESTING;
    });
  }

  public update(
    input: HandInput,
    dt: number,
    toolType: PickShape = "short-hook",
  ) {
    // --- UNLOCK ANIMATION ---
    if (this.state.isUnlocked) {
      this.unlockAnimationTime += dt;

      // 1. Rotate Core to 90
      const targetRot = 90;
      this.state.coreRotation += (targetRot - this.state.coreRotation) * 0.15;

      // 2. Pop Shackle after brief delay
      if (this.unlockAnimationTime > 0.2) {
        const targetShackle = 40;
        this.state.shackleOffset +=
          (targetShackle - this.state.shackleOffset) * 0.2;
      }

      // Don't process physics if unlocked
      return;
    }

    const { pins, bindingOrder, currentBindingIndex } = this.state;

    // Map Input to World Space
    const lockX = 200; // Offset on canvas
    const lockY = 200;
    const worldPickX = lockX + input.pickPosition.x * 400 - 50;
    const worldPickY = lockY + input.pickPosition.y * 200 - 50;

    this.state.pickPosition = { x: worldPickX, y: worldPickY };
    this.state.totalTorque = input.tensionTorque;
    audioService.playScrape(this.state.totalTorque);

    // --- PHYSICS LOOP ---

    // 1. Core Rotation
    const allSet = pins.every((p) => p.state === PinState.SET);
    // Visual rotation only (until unlocked)
    let maxRot = 5;
    if (pins.some((p) => p.state === PinState.FALSE_SET)) {
      maxRot = 15;
    }
    const targetRotation = input.tensionTorque * maxRot;
    this.state.coreRotation += (targetRotation - this.state.coreRotation) * 0.2;

    // 2. Identify Binding Pin
    let activeBindingPinIndex = -1;
    if (input.tensionTorque > 0.2) {
      for (const idx of bindingOrder) {
        if (pins[idx].state !== PinState.SET) {
          activeBindingPinIndex = idx;
          break;
        }
      }
    }
    this.state.currentBindingIndex = activeBindingPinIndex;

    // Track which pin is touched this frame
    let newlyTouchedPinId = -1;

    // Tool Physics Profiles
    let interactionRadius = DIMENSIONS.pinWidth / 2 - 1; // Default (Short Hook)
    let liftJitterScale = 0.0;

    switch (toolType) {
      case "deep-hook":
        interactionRadius = DIMENSIONS.pinWidth / 2 - 3; // Needs more precision/aim
        break;
      case "half-diamond":
        interactionRadius = DIMENSIONS.pinWidth / 2 + 2; // Ramp shape hits wider
        break;
      case "offset-hybrid":
        interactionRadius = DIMENSIONS.pinWidth / 2;
        break;
      case "snake-rake":
      case "city-rake":
        interactionRadius = DIMENSIONS.pinSpacing * 0.5; // Wider, can bridge pins
        liftJitterScale = 0.15; // Rakes are messy
        break;
    }

    // 3. Pin Physics
    pins.forEach((pin, index) => {
      const pinXCenter =
        lockX + 30 + index * DIMENSIONS.pinSpacing + DIMENSIONS.pinWidth / 2;

      // A. Collision with Pick
      // Use modified interaction radius based on tool
      const isPickUnder = Math.abs(worldPickX - pinXCenter) < interactionRadius;
      let upwardForce = 0;

      if (isPickUnder) {
        newlyTouchedPinId = index;
        // The pin's resting bottom is at lockY + DIMENSIONS.keywayHeight.
        // Wait, what is keyway height? Let's use 60 as defined earlier.
        const KEYWAY_FLOOR = 50;
        // If the pick is higher than the bottom, it lifts it.
        const requiredLiftPx = Math.max(0, lockY + KEYWAY_FLOOR - worldPickY);

        if (requiredLiftPx > pin.currentLift * DIMENSIONS.pinMaxLift) {
          const isBinding = index === activeBindingPinIndex;
          let resistance = pin.springForce;
          if (isBinding) {
            resistance += input.tensionTorque * 2.0;
            if (pin.state === PinState.FALSE_SET) {
              if (input.tensionTorque > 0.3) {
                resistance += 100.0; // Blocked! Must drop tension to pick
              } else {
                resistance += 1.0; // Can be picked with light tension
              }
            }
          }

          let targetLift = requiredLiftPx / DIMENSIONS.pinMaxLift;

          // Apply Tool Specific Physics
          if (liftJitterScale > 0) {
            // Simulate the "bitting" or uneven profile of a rake.
            // The effective lift changes as you drag across X (scrubbing).
            // Use worldPickX to create a fixed spatial noise pattern.
            const profile = Math.sin(
              worldPickX * 0.15 + (toolType === "city-rake" ? 0 : Math.PI),
            );
            targetLift += profile * liftJitterScale;
          }

          if (targetLift > pin.currentLift) {
            // Moving UP - Direct control with resistance lag
            const moveSpeed = isBinding ? 0.05 / (resistance + 0.1) : 0.8;
            pin.currentLift += (targetLift - pin.currentLift) * moveSpeed;
            pin.velocity = 0; // Reset downward velocity when being pushed up
          }
        }
      }

      // B. Set / Overset Logic
      let canFall = true;
      const setPoint = 1.0 - pin.keyPinHeight / 50;
      const tolerance = 0.05;

      let falseSetPoints: number[] = [];
      if (pin.type === PinType.SPOOL) falseSetPoints = [setPoint * 0.5];
      else if (pin.type === PinType.SERRATED)
        falseSetPoints = [setPoint * 0.33, setPoint * 0.66];
      else if (pin.type === PinType.SPOORATED)
        falseSetPoints = [setPoint * 0.33, setPoint * 0.5, setPoint * 0.66];

      if (index === activeBindingPinIndex) {
        // We don't want to blindly overwrite state if it's already in a stable state
        // but we DO need to handle newly bound pins.
        if (
          pin.state !== PinState.SET &&
          pin.state !== PinState.FALSE_SET &&
          pin.state !== PinState.OVERSET
        ) {
          pin.state = PinState.BINDING;
        }

        // Check for false sets
        let isFalseSet = false;
        for (const fsp of falseSetPoints) {
          if (Math.abs(pin.currentLift - fsp) < tolerance) {
            isFalseSet = true;
            break;
          }
        }

        if (Math.abs(pin.currentLift - setPoint) < tolerance) {
          if (pin.state !== PinState.SET) {
            pin.state = PinState.SET;
            audioService.playClick(1200);
          }
        } else if (isFalseSet) {
          if (pin.state !== PinState.FALSE_SET) {
            pin.state = PinState.FALSE_SET;
            audioService.playClick(800); // False set click
          }
        } else if (pin.currentLift > setPoint + tolerance) {
          if (pin.state !== PinState.OVERSET) {
            pin.state = PinState.OVERSET;
            audioService.playOverset();
          }
        } else {
          // If it's not at any set point, and we just fell out of one, reset to binding
          if (
            pin.state === PinState.SET ||
            pin.state === PinState.FALSE_SET ||
            pin.state === PinState.OVERSET
          ) {
            pin.state = PinState.BINDING;
          }
        }

        // If it's overset or false set, and we hold tension, it shouldn't fall
        if (
          (pin.state === PinState.OVERSET ||
            pin.state === PinState.FALSE_SET) &&
          input.tensionTorque >= 0.1
        ) {
          canFall = false;
          // also keep it at the false set point or overset point if pick is not under it
          if (!isPickUnder && pin.state === PinState.FALSE_SET) {
            let nearestFsp = falseSetPoints[0];
            for (const fsp of falseSetPoints) {
              if (
                Math.abs(pin.currentLift - fsp) <
                Math.abs(pin.currentLift - nearestFsp)
              ) {
                nearestFsp = fsp;
              }
            }
            pin.currentLift = nearestFsp;
          }
        }
      } else if (
        pin.state === PinState.SET ||
        pin.state === PinState.FALSE_SET
      ) {
        if (input.tensionTorque < 0.1) {
          pin.state = PinState.FALLING;
        } else {
          canFall = false;
          let targetRest = setPoint;
          if (pin.state === PinState.FALSE_SET) {
            let nearestFsp = falseSetPoints[0];
            let minDiff = 999;
            for (const fsp of falseSetPoints) {
              const diff = Math.abs(pin.currentLift - fsp);
              if (diff < minDiff) {
                minDiff = diff;
                nearestFsp = fsp;
              }
            }
            targetRest = nearestFsp;
          }

          if (
            pin.currentLift > setPoint + tolerance &&
            pin.state === PinState.SET
          ) {
            pin.state = PinState.OVERSET;
            audioService.playOverset();
          } else if (!isPickUnder || pin.currentLift < targetRest) {
            pin.currentLift = targetRest;
          }
        }
      } else if (pin.state === PinState.OVERSET) {
        if (input.tensionTorque < 0.1) {
          pin.state = PinState.FALLING;
        } else {
          canFall = false;
        }
      }

      // C. Apply Gravity & Spring Bounce
      if (canFall && !isPickUnder) {
        // Apply gravity to velocity
        // Gravity scaled up to feel snappy in 0-1 space
        const gravityAccel = this.config.gravity * 2.0;
        pin.velocity += gravityAccel * dt;

        // Apply velocity to position
        pin.currentLift -= pin.velocity * dt;

        // Floor Collision (Bounce)
        if (pin.currentLift < 0) {
          if (pin.velocity > 0.5) {
            // Bounce
            pin.currentLift = 0;
            pin.velocity = -pin.velocity * 0.35; // 35% restitution
            audioService.playThud();
          } else {
            // Settle
            pin.currentLift = 0;
            pin.velocity = 0;
            pin.state = PinState.RESTING;
          }
        }
      } else {
        if (!canFall) pin.velocity = 0;
      }

      // Clamp Ceiling
      if (pin.currentLift > 1.1) {
        pin.currentLift = 1.1;
        pin.velocity = 0;
      }
    });

    // Handle Contact Audio
    if (newlyTouchedPinId !== this.lastTouchedPinId) {
      if (newlyTouchedPinId !== -1) {
        // Only play if we are entering a pin zone, not leaving one
        audioService.playContact();
      }
      this.lastTouchedPinId = newlyTouchedPinId;
    }
  }
}

export const lockService = new LockService();
