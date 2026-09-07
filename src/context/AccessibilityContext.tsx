import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Tema = 'light' | 'dark' | 'system';
export type FiltroDaltonismo = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

interface AccessibilityState {
  fontScale: number;
  letterSpacing: number;
  dyslexiaFont: boolean;
  highContrast: boolean;
  colorblindFilter: FiltroDaltonismo;
  theme: Tema;
  reducedMotion: boolean;
  highlightLinks: boolean;
}

const DEFAULT_STATE: AccessibilityState = {
  fontScale: 100,
  letterSpacing: 100,
  dyslexiaFont: false,
  highContrast: false,
  colorblindFilter: 'none',
  theme: 'system',
  reducedMotion: false,
  highlightLinks: false,
};

const STORAGE_KEY = 'greontrack-accesibilidad';

interface AccessibilityContextValue extends AccessibilityState {
  setFontScale: (v: number) => void;
  setLetterSpacing: (v: number) => void;
  setDyslexiaFont: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setColorblindFilter: (v: FiltroDaltonismo) => void;
  setTheme: (v: Tema) => void;
  setReducedMotion: (v: boolean) => void;
  setHighlightLinks: (v: boolean) => void;
  resetAll: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

function cargarEstadoGuardado(): AccessibilityState {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) return { ...DEFAULT_STATE, ...JSON.parse(guardado) };
  } catch {
    // localStorage puede fallar (privado, cuota, etc.) — se usa el default sin romper la app.
  }
  return DEFAULT_STATE;
}

const FILTROS_DALTONISMO: Record<Exclude<FiltroDaltonismo, 'none'>, string> = {
  protanopia: 'url(#greontrack-protanopia)',
  deuteranopia: 'url(#greontrack-deuteranopia)',
  tritanopia: 'url(#greontrack-tritanopia)',
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(cargarEstadoGuardado);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // per-viewer convenience only; si falla, simplemente no persiste esta vez.
    }

    const root = document.documentElement;
    root.setAttribute('data-font-scale', String(state.fontScale));
    root.setAttribute('data-letter-spacing', String(state.letterSpacing));
    root.toggleAttribute('data-dyslexia-font', state.dyslexiaFont);
    root.toggleAttribute('data-high-contrast', state.highContrast);
    root.toggleAttribute('data-reduced-motion', state.reducedMotion);
    root.toggleAttribute('data-highlight-links', state.highlightLinks);

    // Tema oscuro: paleta real definida en index.css bajo [data-theme-dark]
    // (no un filtro de inversión — se veía mal, colores no diseñados a
    // propósito para oscuro).
    const esOscuro =
      state.theme === 'dark' ||
      (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.toggleAttribute('data-theme-dark', esOscuro);

    // El filtro de daltonismo sí usa `filter` (es su propósito real: simular
    // la deficiencia visual sobre lo que ya se está viendo).
    document.body.style.filter =
      state.colorblindFilter !== 'none' ? FILTROS_DALTONISMO[state.colorblindFilter] : '';
  }, [state]);

  // "Sistema": si el usuario cambia el tema del SO mientras la app está
  // abierta, se refleja sin recargar.
  useEffect(() => {
    if (state.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setState((s) => ({ ...s }));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [state.theme]);

  const value: AccessibilityContextValue = {
    ...state,
    setFontScale: (v) => setState((s) => ({ ...s, fontScale: v })),
    setLetterSpacing: (v) => setState((s) => ({ ...s, letterSpacing: v })),
    setDyslexiaFont: (v) => setState((s) => ({ ...s, dyslexiaFont: v })),
    setHighContrast: (v) => setState((s) => ({ ...s, highContrast: v })),
    setColorblindFilter: (v) => setState((s) => ({ ...s, colorblindFilter: v })),
    setTheme: (v) => setState((s) => ({ ...s, theme: v })),
    setReducedMotion: (v) => setState((s) => ({ ...s, reducedMotion: v })),
    setHighlightLinks: (v) => setState((s) => ({ ...s, highlightLinks: v })),
    resetAll: () => setState(DEFAULT_STATE),
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility debe usarse dentro de <AccessibilityProvider>');
  return ctx;
}
