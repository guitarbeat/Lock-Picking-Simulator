---
name: Terminal Hardware
colors:
  background: "#121212"
  surface: "#1a1a1a"
  surface-panel: "#0f0f0f"
  surface-bright: "#2a2a2a"
  outline: "#333333"
  outline-dim: "#222222"
  outline-bright: "#3a3a3a"
  on-surface: "#e0e0e0"
  on-surface-variant: "#808080"
  primary: "#f97316"
  on-primary: "#ffffff"
  secondary: "#10b981"
  error: "#ef4444"
  grid-line: "rgba(255, 255, 255, 0.05)"
typography:
  display:
    fontFamily: "JetBrains Mono"
    fontSize: "24px"
    fontWeight: "700"
    letterSpacing: "4px"
    textTransform: "uppercase"
  heading:
    fontFamily: "JetBrains Mono"
    fontSize: "12px"
    fontWeight: "600"
    letterSpacing: "0.1em"
    textTransform: "uppercase"
  body:
    fontFamily: "JetBrains Mono"
    fontSize: "11px"
    fontWeight: "400"
    letterSpacing: "2px"
    textTransform: "uppercase"
  label:
    fontFamily: "JetBrains Mono"
    fontSize: "10px"
    fontWeight: "700"
    letterSpacing: "0.1em"
    textTransform: "uppercase"
  micro:
    fontFamily: "JetBrains Mono"
    fontSize: "9px"
    fontWeight: "400"
    letterSpacing: "0.1em"
    textTransform: "uppercase"
rounded:
  sm: "4px"
  DEFAULT: "6px"
  md: "8px"
  full: "9999px"
spacing:
  container-padding: "24px"
  widget-padding: "12px"
  gap-sm: "8px"
  gap-md: "16px"
  gap-lg: "32px"
shadows:
  hardware-panel: "inset 0 2px 10px rgba(0,0,0,0.8)"
  hardware-widget: "0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
  hardware-btn: "0 2px 4px rgba(0,0,0,0.4)"
  hardware-btn-active: "inset 0 2px 4px rgba(0,0,0,0.6)"
  glow-primary: "0 0 15px rgba(249,115,22,0.4)"
components:
  hardware-panel:
    backgroundColor: "{colors.surface-panel}"
    border: "1px solid {colors.outline-dim}"
    rounded: "{rounded.DEFAULT}"
    boxShadow: "{shadows.hardware-panel}"
  hardware-widget:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.outline}"
    rounded: "{rounded.md}"
    boxShadow: "{shadows.hardware-widget}"
  hardware-btn:
    background: "linear-gradient(180deg, {colors.surface-bright} 0%, {colors.surface} 100%)"
    border: "1px solid #000"
    borderTop: "1px solid {colors.outline-bright}"
    rounded: "{rounded.sm}"
    textColor: "#ccc"
    boxShadow: "{shadows.hardware-btn}"
---

## Brand & Style

This design system utilizes a "Terminal Hardware" aesthetic, purposely evoking the tactile, unforgiving feeling of cyber-physical diagnostic equipment. It leans heavily into a brutalist, industrial identity characterized by dense monospace typography, high-contrast neon accents, and deep obsidian backgrounds.

The interface serves as an "Internal Mechanics Simulator" or a precise diagnostic console, rather than a consumer web application. The emotional response is intended to be focused, technical, and slightly intense, simulating a high-stakes engineering or system override environment.

## Colors

The color palette centers on the stark contrast between matte hardware casings and vivid neon signals.

*   **Physical Darks:** The background and container surfaces (`#121212`, `#0f0f0f`, `#1a1a1a`) represent non-reflective physical hardware, like server chassis or reinforced plastic housings.
*   **Phosphor Typography:** Text exclusively relies on high-contrast white (`#e0e0e0`) for primary readouts and medium gray (`#808080`) for inactive labels, structural text, or secondary ambient data.
*   **State Indicators (The Signals):** 
    *   **Action/Active:** A burning orange (`#f97316`) is the primary accent, used for major calls-to-action, telemetry feeds, and motion tracking.
    *   **System Secure/Override:** Emerald green (`#10b981`) indicates successful lock bypasses, correct states, and secure configurations.
    *   **System Fault:** Stark red (`#ef4444`) warns of critical structural failures, sensor disconnections, or system errors.

## Typography

The typography discards conventional sans-serif readability in favor of a strictly systemic, raw terminal approach.

*   **Sole Typeface:** `JetBrains Mono` forms the complete typographic voice, instantly categorizing all text as machine output or code.
*   **Sizing & Tracking:** To simulate high-density, complex data arrays, font sizes are severely minimized (typically between `9px` and `11px` for UI text). Legibility is restored through aggressive letter-spacing (`tracking-widest` or `4px` gaps) and absolute `uppercase` transformations.
*   **Structural Signifiers:** Text elements frequently incorporate structural adornments such as `//` or `::` (e.g., `System::Override` or `// Telemetry Source`), treating labels as code comments or directory paths to reinforce the programmer/engineer theme.

## Layout & Spacing

Spatial organization models the strict confines of physical control panels. 

*   **The Blueprint Grid:** The viewport is permanently anchored by an underlying `20px` grid pattern (`rgba(255, 255, 255, 0.05)`), grounding the application firmly in an architectural or engineering context.
*   **Modular Constraints:** Tooling and data readouts are strictly partitioned into compact, bordered widgets. Padding is constrained, mirroring the real-world premium of surface area on a hardware dashboard.

## Elevation & Depth

Dimensionality eschews the soft floating blurs of modern UI in favor of heavy, fabricated physical depth.

*   **The Hardware Deck:**
    *   **Level 0 (Chassis):** The matte dark canvas holding the structural grid.
    *   **Level -1 (Recessed Panels):** `.hardware-panel` utilizes an aggressive dark inner shadow (`inset 0 2px 10px rgba(0,0,0,0.8)`) making the container appear carved *down* into the chassis.
    *   **Level 1 (Raised Widgets):** `.hardware-widget` sits elevated above the grid via a sharp drop shadow, combined with a 1px sub-pixel top highlight (`inset 0 1px 0 rgba(255,255,255,0.05)`) mimicking a raised module catching overhead light.
*   **Tactile Buttons:** Interactive elements are detailed as physical switches or keys. They employ top-to-bottom linear gradients and specific top-border highlights (`#3a3a3a`). Active states reverse these gradients and plunge the element downward with inset shadows to simulate the satisfying resistance of mechanical switches.

## Shapes

Geometry is exclusively sharp, rigid, and engineered.

*   **Housings:** Major panels utilize a slight `6px` radius, while raised widgets use `8px`. This minimal rounding suggests safety-cornered manufactured hardware, deliberately avoiding pill-shapes or hyper-rounded friendly forms.
*   **Input Mechanisms:** Default browser sliders and trackers are entirely restyled. Trackers are severe `<div/>` structures, often featuring pitch-black recessed channels and rigid, rectangular thumb indicators that snap forcefully to positions. 

## Components

### Hardware Panels (`.hardware-panel`)
The foundational containers for configuration screens and system messaging. These are recessed areas acting as the primary viewing zones cut down into the device casing. 

### Modular Widgets (`.hardware-widget`)
Floating HUD enclosures utilized for telemetry components and the interactive control pad. These components hover above the grid and project data via highly contrasting components and neon states.

### Tactile Action Triggers (`.hardware-btn`)
Physicalized interactive buttons handling primary system inputs (e.g., initialization, termination). Often coupled with faint external colored glows (`0 0 15px rgba(249,115,22,0.4)`) to signal active or primed states, breaking off the surrounding dark surface.

### Displays & Readouts
Text-only displays simulate primitive LCD or CRT monitors. They utilize pure black (`#000`) internal panels with distinct, bright orange or red monospace readouts to separate data streams perfectly from the ambient dark-gray UI text.
