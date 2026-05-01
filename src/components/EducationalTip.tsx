import React from 'react';
import { LockState, PinState } from '../types';

interface EducationalTipProps {
    lockState: LockState;
    inputMethod: string;
}

const EducationalTip: React.FC<EducationalTipProps> = ({ lockState, inputMethod }) => {
    
    let tip = "";
    let alertLevel = "info"; // info, warning, error, success

    const pins = lockState.pins || [];
    const oversetPins = pins.filter(p => p.state === PinState.OVERSET);
    const setPins = pins.filter(p => p.state === PinState.SET);
    const bindingPins = pins.filter(p => p.state === PinState.BINDING);
    const atLeastOneFalling = pins.filter(p => p.state === PinState.FALLING).length > 0;

    if (lockState.isUnlocked) {
        tip = "Success! The lock is open.";
        alertLevel = "success";
    } else if (oversetPins.length > 0) {
        tip = "Pin OVERSET! You lifted it past the shear line. Release tension to drop it.";
        alertLevel = "error";
    } else if (lockState.totalTorque < 0.1) {
        tip = "First, apply TENSION to the core so that lifted pins can bind.";
        alertLevel = "warning";
    } else if (lockState.totalTorque >= 0.1 && bindingPins.length > 0 && bindingPins[0].currentLift > 0.05 && bindingPins[0].currentLift < 0.9) {
        tip = "Pin is binding! Lift it slowly until it clicks at the shear line.";
        alertLevel = "info";
    } else if (lockState.totalTorque >= 0.1 && bindingPins.length > 0) {
        tip = "Find the BINDING (stiff) pin and lift it.";
        alertLevel = "info";
    } else if (lockState.totalTorque > 0.8 && oversetPins.length === 0) {
        tip = "Too much tension can make pins impossible to lift. Try easing off slightly.";
        alertLevel = "warning";
    } else {
        if (setPins.length > 0) {
            tip = `Good! ${setPins.length} pin(s) set. Now find the next binding pin.`;
            alertLevel = "success";
        } else {
            tip = "Move the pick to lift pins while holding tension.";
            alertLevel = "info";
        }
    }

    const bgMap: Record<string, string> = {
        info: "bg-blue-900/40 border-blue-500/50 text-blue-200",
        warning: "bg-orange-900/40 border-orange-500/50 text-orange-200",
        error: "bg-red-900/40 border-red-500/50 text-red-200",
        success: "bg-emerald-900/40 border-emerald-500/50 text-emerald-200"
    };

    const iconMap: Record<string, JSX.Element> = {
        info: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        success: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    };

    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-md shadow-lg transition-colors duration-300 ${bgMap[alertLevel]} max-w-sm w-full mx-auto`}>
            {iconMap[alertLevel]}
            <p className="font-sans text-sm font-semibold leading-snug">
                {tip}
            </p>
        </div>
    );
};

export default EducationalTip;
