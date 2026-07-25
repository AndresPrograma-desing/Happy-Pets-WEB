import { useEffect, useState, useRef } from 'react';

export function useCountdown(active, duration, onComplete, expiresAt, totalDuration = 900000) {
  const [state, setState] = useState({ progress: 100, remainingSeconds: duration / 1000 });

  // Refs to store stable values
  const expiresAtRef = useRef(expiresAt);
  const totalDurationRef = useRef(totalDuration);
  const durationRef = useRef(duration);
  const onCompleteRef = useRef(onComplete);

  // Keep refs updated with latest prop values
  useEffect(() => {
    if (!active) {
      expiresAtRef.current = null;
      totalDurationRef.current = null;
    } else {
      // Only capture the initial value when it becomes active
      if (expiresAt && !expiresAtRef.current) {
        expiresAtRef.current = expiresAt;
      }
      if (totalDuration && !totalDurationRef.current) {
        totalDurationRef.current = totalDuration;
      }
    }
  }, [active, expiresAt, totalDuration]);

  // Keep other refs updated
  useEffect(() => {
    durationRef.current = duration;
    onCompleteRef.current = onComplete;
  }, [duration, onComplete]);

  useEffect(() => {
    if (!active) {
      setState({ progress: 100, remainingSeconds: durationRef.current / 1000 });
      return;
    }

    const startTime = Date.now();
    const interval = 50;

    const timer = setInterval(() => {
      let remaining;
      let percentage;

      const targetExpiresAt = expiresAtRef.current;
      const targetTotalDuration = totalDurationRef.current || 900000;

      if (targetExpiresAt) {
        const expirationTime = new Date(targetExpiresAt).getTime();
        remaining = Math.max(0, expirationTime - Date.now());
        percentage = (remaining / targetTotalDuration) * 100;
      } else {
        const elapsed = Date.now() - startTime;
        remaining = Math.max(0, durationRef.current - elapsed);
        percentage = (remaining / durationRef.current) * 100;
      }

      const finalProgress = Math.max(0, Math.min(100, percentage));
      setState({
        progress: finalProgress,
        remainingSeconds: remaining / 1000
      });

      if (remaining <= 0) {
        clearInterval(timer);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [active]);

  return state;
}

// Funciones auxiliares para interpolar colores en formato HEX
function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function interpolateColor(color1, color2, factor) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = c1[0] + factor * (c2[0] - c1[0]);
  const g = c1[1] + factor * (c2[1] - c1[1]);
  const b = c1[2] + factor * (c2[2] - c1[2]);
  return rgbToHex(r, g, b);
}

export function getColorForProgress(progress, customColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']) {
  // progress va de 100 (inicio) a 0 (fin)
  // Invertimos el cálculo para que 100% sea el inicio del array y 0% sea el final
  const p = Math.max(0, Math.min(100, progress)) / 100;
  
  if (customColors.length < 2) return customColors[0] || '#3b82f6';

  const scaled = p * (customColors.length - 1);
  const index = Math.floor(scaled);
  const factor = scaled - index;

  if (index >= customColors.length - 1) {
    return customColors[customColors.length - 1];
  }

  return interpolateColor(customColors[index], customColors[index + 1], factor);
}