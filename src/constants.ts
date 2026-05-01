
import { GameConfig, PickTool, LevelDefinition } from './types';

export const CONFIG: GameConfig = {
  pinCount: 5,
  gravity: 1.2, 
  springConstant: 0.15,
  friction: 0.92,
  pickRadius: 8,
  shearLineY: 200, 
};

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    name: "Novice",
    description: "Standard 3-pin practice lock. Loose tolerances.",
    pinCount: 3,
    configOverrides: {
      gravity: 1.0,
      springConstant: 0.12,
      friction: 0.95 // High friction, pins stay put easier
    }
  },
  {
    id: 2,
    name: "Apprentice",
    description: "4 pins. Standard springs. Gravity increases.",
    pinCount: 4,
    configOverrides: {
      gravity: 1.2,
      springConstant: 0.15,
      friction: 0.92
    }
  },
  {
    id: 3,
    name: "Journeyman",
    description: "5 pins. Tighter springs require precise tension.",
    pinCount: 5,
    configOverrides: {
      gravity: 1.4,
      springConstant: 0.18,
      friction: 0.90
    }
  },
  {
    id: 4,
    name: "Expert",
    description: "6 pins. Heavy pins drop instantly without tension.",
    pinCount: 6,
    configOverrides: {
      gravity: 1.8,
      springConstant: 0.22,
      friction: 0.85
    }
  },
  {
    id: 5,
    name: "Grandmaster",
    description: "6 pins. Maximum difficulty. Twitchy feedback.",
    pinCount: 6,
    configOverrides: {
      gravity: 2.2,
      springConstant: 0.25,
      friction: 0.80
    }
  }
];

export const COLORS = {
  background: '#1c1917', // Dark bench background
  // Realistic metal lock body
  lockBodyFill: '#a3a3a3', // brushed metal housing
  lockBodyBorder: '#404040',
  lockChamber: '#525252',

  // Metals
  shackle: '#525252',
  brassStart: '#d4af37', // Gold/Brass
  brassMid: '#fde047',
  brassEnd: '#a16207',
  
  chromeStart: '#e2e8f0', // Chrome/Silver
  chromeMid: '#ffffff',
  chromeEnd: '#94a3b8',

  // Functional
  shearLine: '#ef4444',
  spring: '#64748b',     
  pick: '#94a3b8',       
  tensionWrench: '#94a3b8', 
  highlight: '#ffffff',  
  success: '#22c55e',    
  fail: '#ef4444',       
  warning: '#f59e0b',    
};

export const DIMENSIONS = {
  pinWidth: 26, 
  pinSpacing: 48,
  pinMaxLift: 50,
  lockWidth: 320,
  lockHeight: 160,
  shackleThickness: 25,
};

export const PICK_TOOLS: PickTool[] = [
  { id: 'short-hook', name: 'Short Hook', description: 'Standard profile. Versatile and precise for single pin picking.' },
  { id: 'deep-hook', name: 'Deep Hook', description: 'Increased reach. Perfect for setting high pins behind low ones.' },
  { id: 'offset-hybrid', name: 'Offset Hybrid', description: 'Rounded tip combining a hook and a half-diamond. Good all-rounder.' },
  { id: 'half-diamond', name: 'Half Diamond', description: 'Triangular head. Effective for both lifting and kinetic attacks.' },
  { id: 'snake-rake', name: 'Snake Rake', description: 'S-curved profile designed for scrubbing multiple pins quickly.' },
  { id: 'city-rake', name: 'City Rake', description: 'Saw-tooth pattern mimicking common key bitting. Great for rocking.' },
];
