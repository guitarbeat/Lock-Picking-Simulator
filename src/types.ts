
export enum ViewMode {
  SIDE = 'SIDE',
  FRONT = 'FRONT',
  SPLIT = 'SPLIT'
}

export enum GameState {
  MENU = 'MENU',
  LOADING = 'LOADING',
  CALIBRATING = 'CALIBRATING',
  PLAYING = 'PLAYING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL'
}

export enum GameMode {
  TUTORIAL = 'TUTORIAL',
  CAMPAIGN = 'CAMPAIGN'
}

export enum TutorialStep {
  WAITING_FOR_HAND = 0,
  APPLY_TENSION_LIGHT = 1,
  APPLY_TENSION_HEAVY = 2,
  ENTER_LOCK = 3,
  FIND_BINDING = 4,
  LIFT_PIN_GENTLY = 5,
  SET_FIRST_PIN = 6,
  DO_NOT_OVERSET = 7,
  COMPLETED = 8
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HandInput {
  pickPosition: Vector2; // Normalized 0-1
  tensionTorque: number; // 0-1 value representing rotational force
  isTracking: boolean;
}

export enum PinState {
  RESTING = 'RESTING',
  BINDING = 'BINDING',
  SET = 'SET',
  FALSE_SET = 'FALSE_SET',
  OVERSET = 'OVERSET',
  FALLING = 'FALLING'
}

export enum PinType {
  NORMAL = 'NORMAL',
  SPOOL = 'SPOOL',
  SERRATED = 'SERRATED',
  SPOORATED = 'SPOORATED'
}

export interface Pin {
  id: number;
  // Physics properties
  keyPinHeight: number;
  driverPinHeight: number;
  springForce: number;
  bindingThreshold: number; // How much torque makes this pin bind
  type: PinType;
  
  // State
  currentLift: number; // 0 to 1 (1 is max lift)
  velocity: number;
  state: PinState;
  
  // Visual
  color: string;
}

export interface LockState {
  pins: Pin[];
  bindingOrder: number[];
  currentBindingIndex: number; // Which pin is currently binding
  coreRotation: number; // -5 to 5 degrees visual rotation
  totalTorque: number; // Current applied torque
  pickPosition: Vector2; // Current pick tip position in world space
  isUnlocked: boolean;
  shackleOffset: number;
}

export interface GameConfig {
  pinCount: number;
  gravity: number;
  springConstant: number;
  friction: number;
  pickRadius: number;
  shearLineY: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  description: string;
  pinCount: number;
  configOverrides: Partial<GameConfig>;
}

// --- NEW TOOL DEFINITIONS ---
export type PickShape = 'short-hook' | 'deep-hook' | 'offset-hybrid' | 'half-diamond' | 'snake-rake' | 'city-rake';

export interface PickTool {
  id: PickShape;
  name: string;
  description: string;
}
