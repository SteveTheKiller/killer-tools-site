import type { GlobalThemeOverrides } from 'naive-ui';

// ── KillerTools Grunge theme engine: six family themes + per-theme accents,
// ported from the apps/landing pages. Default = Black(Teal), the site identity.
// Neutral themes (Dark, Light, Black) support eight accent colors; the
// colored themes (Blood, Greed, Cyanotic) have fixed palettes.

export type KtThemeKey = 'dark' | 'light' | 'black' | 'blood' | 'greed' | 'cyanotic'
  | 'ectoplasm' | 'decay' | 'malaise' | 'sepulchre' | 'delirium' | 'mourning' | 'trashpolka';
export type KtAccentKey = 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'purple' | 'magenta';
export type KtAccentFamily = 'dark' | 'light' | 'black' | 'trashpolka';

export const NEUTRAL_THEMES: KtThemeKey[] = ['dark', 'light', 'black'];

// Themes with an accent picker: the neutral three plus Trash Polka, which keeps
// its own accent choice (KillerUI stores it per family, Red by default)
export const ACCENT_THEMES: KtThemeKey[] = [...NEUTRAL_THEMES, 'trashpolka'];

export function accentFamilyOf(theme: KtThemeKey): KtAccentFamily | null {
  return theme === 'light' || theme === 'black' || theme === 'dark' || theme === 'trashpolka' ? theme : null;
}

// Per-family accent palette, copied from the app (kf.js ACCENTS). Trash Polka
// comes from KillerUI Themes/TrashPolka.xaml and Themes/Accents/TrashPolka,
// except Blue: the site uses a lighter #5E8EE8 (KillerUI keeps #3A6FD0) so
// headings read over the ink. Steve chose site-only on 2026-11-24.
export const ktAccents: Record<KtAccentFamily, Record<KtAccentKey, string>> = {
  trashpolka: { red: '#D7263D', orange: '#EE7B22', yellow: '#EED500', green: '#7A9A3A', teal: '#1E9A96', blue: '#5E8EE8', purple: '#8A4CC2', magenta: '#E4588E' },
  dark: { red: '#DD504B', orange: '#E8962C', yellow: '#EAD900', green: '#1EA54C', teal: '#1FB8A8', blue: '#50AEE8', purple: '#B982E3', magenta: '#FF52C9' },
  light: { red: '#931A1A', orange: '#C7710F', yellow: '#2B2A24', green: '#1B5E20', teal: '#0D827E', blue: '#18608E', purple: '#5A1690', magenta: '#A60070' },
  black: { red: '#FF2929', orange: '#FF910A', yellow: '#FFEB00', green: '#00FF66', teal: '#0AFFE7', blue: '#298DFF', purple: '#B829FF', magenta: '#FF2BBD' },
};

// Theme default accents (used when the user has not picked one)
export const THEME_DEFAULT_ACCENT: Partial<Record<KtThemeKey, KtAccentKey>> = {
  dark: 'blue',
  light: 'blue',
  black: 'teal',
  trashpolka: 'red',
};

// SelectionBg per family+accent, straight from the app's accent overlay files
// (Themes/Accents/*/*.xaml): the MUTED accent for tab stripes and selected
// surfaces. The app leaves Orange's SelectionBg == base (Black/Orange.xaml);
// here we give Orange a proper muted selection (#4E2900 black / #5E3B16 dark)
// so every accent follows the two-color rule on the site.
const ktAccentSel: Record<KtAccentFamily, Record<KtAccentKey, string>> = {
  trashpolka: { red: '#4A1218', orange: '#55300E', yellow: '#EED500', green: '#303A1D', teal: '#153A39', blue: '#1D2D4A', purple: '#352346', magenta: '#502636' },
  dark: { red: '#5E1C1C', orange: '#5E3B16', yellow: '#2A2908', green: '#1C5E38', teal: '#1C5E5C', blue: '#1C3B5E', purple: '#411C5E', magenta: '#2A0D24' },
  black: { red: '#380000', orange: '#4E2900', yellow: '#2E2B00', green: '#003314', teal: '#003832', blue: '#0A2C50', purple: '#250038', magenta: '#2E0022' },
  light: { red: '#931A1A', orange: '#C7710F', yellow: '#FFD94D', green: '#1B5E20', teal: '#0D827E', blue: '#18608E', purple: '#5A1690', magenta: '#A60070' },
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [Number.parseInt(h.slice(0, 2), 16), Number.parseInt(h.slice(2, 4), 16), Number.parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(rgb: [number, number, number]): string {
  return `#${rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
}

// f > 0 mixes toward white, f < 0 toward black
function shade(hex: string, f: number): string {
  const rgb = hexToRgb(hex);
  return rgbToHex(rgb.map(v => (f >= 0 ? v + (255 - v) * f : v * (1 + f))) as [number, number, number]);
}

export interface AccentTriple {
  base: string
  hover: string
  pressed: string
  sel: string
  rgb: [number, number, number]
}

export function accentTriple(theme: KtThemeKey, accent?: KtAccentKey | ''): AccentTriple | null {
  const fam = accentFamilyOf(theme);
  if (!fam) {
    return null; // fixed-palette theme
  }
  const name: KtAccentKey = (accent && ktAccents[fam][accent]) ? accent as KtAccentKey : THEME_DEFAULT_ACCENT[theme]!;
  const base = ktAccents[fam][name];
  const sel = ktAccentSel[fam][name];
  if (fam === 'trashpolka') {
    // KillerUI Trash Polka: hover and pressed are the base ink itself
    return { base, hover: base, pressed: base, sel, rgb: hexToRgb(base) };
  }
  return { base, hover: shade(base, 0.18), pressed: shade(base, -0.2), sel, rgb: hexToRgb(base) };
}

interface DarkPalette {
  bg: string
  chrome: string
  chromeBorder: string
  panel: string
  panelBorder: string
  input: string
  popup: string
  tableTd: string
  tableTh: string
  notif: string
  /* App InputHoverBrush: full-strength hover border on inputs/selects
     (Malaise sand #c2b280). Falls back to accent at 45% alpha. */
  inputHover?: string
  accent: [number, number, number]
  accentHex: string
  accentHover: string
  accentPressed: string
  accentSel: string
  text?: string
  text2?: string
  /* Warm cream text accent on colored themes (menu hover, highlights) */
  textAccent?: string
  /* Text on the SelectionBg bar: white, except Trash Polka Yellow's solid yellow bar */
  selText?: string
}

function a(rgb: [number, number, number], alpha: number) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function buildDarkOverrides(p: DarkPalette): GlobalThemeOverrides {
  const text = p.text ?? 'rgba(255, 255, 255, 0.85)';
  return {
    common: {
      primaryColor: `${p.accentHex}FF`,
      primaryColorHover: `${p.accentHover}FF`,
      primaryColorPressed: `${p.accentPressed}FF`,
      primaryColorSuppl: `${p.accentHover}FF`,
      bodyColor: p.bg,
      ...(p.text ? { textColorBase: p.text, textColor1: p.text, textColor2: p.text2, textColor3: p.text2 } : {}),
    },

    Notification: {
      color: p.notif,
    },

    // Checks and radios follow the theme accent (the apps' RadioAccent), not
    // primaryColor: Blood, Greed and Cyanotic keep the install-button green
    // or gold as primary, which would otherwise color every check box
    Checkbox: {
      colorChecked: 'var(--kt-accent)',
      borderChecked: '1px solid var(--kt-accent)',
      borderFocus: '1px solid var(--kt-accent)',
      boxShadowFocus: '0 0 0 2px rgba(var(--kt-accent-rgb), 0.3)',
      checkMarkColor: '#111111',
    },

    Radio: {
      dotColorActive: 'var(--kt-accent)',
      boxShadowActive: 'inset 0 0 0 1px var(--kt-accent)',
      boxShadowFocus: 'inset 0 0 0 1px var(--kt-accent), 0 0 0 2px rgba(var(--kt-accent-rgb), 0.3)',
      boxShadowHover: 'inset 0 0 0 1px var(--kt-accent)',
    },

    AutoComplete: {
      peers: {
        InternalSelectMenu: { height: '500px', color: p.popup },
      },
    },

    Select: {
      peers: {
        // Trigger (InternalSelection): solid bg so grain doesn't bleed through
        InternalSelection: {
          color: p.input,
          colorActive: p.input,
          border: `1px solid ${a(p.accent, 0.22)}`,
          borderHover: `1px solid ${p.inputHover ?? a(p.accent, 0.45)}`,
          borderActive: `1px solid ${a(p.accent, 0.65)}`,
          borderFocus: `1px solid ${a(p.accent, 0.65)}`,
          textColor: text,
          placeholderColor: 'rgba(255, 255, 255, 0.25)',
          arrowColor: a(p.accent, 0.6),
          arrowColorDisabled: 'rgba(255, 255, 255, 0.2)',
        },
        // Dropdown popup: solid near-chrome with accent theming
        InternalSelectMenu: {
          color: p.popup,
          optionTextColor: 'rgba(255, 255, 255, 0.75)',
          optionTextColorActive: p.accentHex,
          optionColorActive: a(p.accent, 0.10),
          optionColorActivePending: a(p.accent, 0.18),
          groupHeaderTextColor: a(p.accent, 0.60),
        },
      },
    },

    Menu: {
      itemHeight: '32px',
      color: 'transparent',
      /* App selection model: solid SelectionBg bar, white SelectionFg */
      itemColorActive: p.accentSel,
      itemColorActiveHover: p.accentSel,
      itemTextColorActive: p.selText ?? '#ffffff',
      itemIconColorActive: p.selText ?? '#ffffff',
      itemTextColorActiveHover: p.selText ?? '#ffffff',
      itemIconColorActiveHover: p.selText ?? '#ffffff',
      /* Text accent, NOT the button color: colored themes (Blood/Greed/
         Cyanotic) use warm cream lettering while their buttons stay green/gold */
      itemTextColorChildActive: p.textAccent ?? p.text ?? p.accentHex,
      itemIconColorChildActive: p.textAccent ?? p.text ?? p.accentHex,
      itemColorHover: 'rgba(255, 255, 255, 0.07)',
      /* Hover: accent lettering on the gray bar (stroke added in CSS) */
      itemTextColorHover: p.textAccent ?? p.text ?? p.accentHex,
      itemIconColorHover: p.textAccent ?? p.text ?? p.accentHex,
    },

    Layout: {
      color: p.bg, // content pane
      siderColor: p.chrome, // chrome: matches the titlebar/statusbar rails
      siderBorderColor: p.chromeBorder,
    },

    Card: {
      color: p.panel,
      borderColor: p.panelBorder,
    },

    Button: {
      color: 'rgba(0, 0, 0, 0.35)',
      colorHover: a(p.accent, 0.08),
      colorPressed: 'rgba(0, 0, 0, 0.50)',
      colorFocus: a(p.accent, 0.08),
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderHover: `1px solid ${a(p.accent, 0.45)}`,
      borderPressed: `1px solid ${a(p.accent, 0.65)}`,
      borderFocus: `1px solid ${a(p.accent, 0.45)}`,
      textColor: 'rgba(255, 255, 255, 0.6)',
      textColorHover: p.accentHex,
      textColorPressed: p.accentHover,
      textColorFocus: p.accentHex,
      borderRadius: '12px',
      fontWeight: '500',
    },

    Input: {
      color: p.input,
      colorFocus: p.input,
      border: `1px solid ${a(p.accent, 0.22)}`,
      borderHover: `1px solid ${p.inputHover ?? a(p.accent, 0.45)}`,
      borderFocus: `1px solid ${a(p.accent, 0.65)}`,
      textColor: text,
      textColorDisabled: 'rgba(255, 255, 255, 0.3)',
      placeholderColor: 'rgba(255, 255, 255, 0.2)',
      caretColor: p.accentHex,
      boxShadowFocus: `0 0 0 2px ${a(p.accent, 0.12)}`,
    },

    Table: {
      tdColor: p.tableTd,
      thColor: p.tableTh,
    },

    Popover: {
      color: p.popup,
    },
  };
}

function buildLightOverrides(t: AccentTriple): GlobalThemeOverrides {
  const selectedText = t.sel === '#FFD94D' ? '#24231C' : '#ffffff';
  return {
    common: {
      primaryColor: `${t.base}FF`,
      primaryColorHover: `${t.hover}FF`,
      primaryColorPressed: `${t.pressed}FF`,
      primaryColorSuppl: `${t.hover}FF`,
      bodyColor: '#b8b8b8',
      textColorBase: '#1a1e22',
      textColor1: '#1a1e22',
      textColor2: '#2e3440',
      textColor3: '#485060',
      placeholderColor: '#6a7280',
    },

    Menu: {
      itemHeight: '32px',
      color: 'transparent',
      itemTextColor: '#1e2022',
      /* App selection model: SelectionBg fill with matching SelectionFg */
      itemColorActive: t.sel,
      itemColorActiveHover: t.sel,
      itemTextColorActive: selectedText,
      itemIconColorActive: selectedText,
      itemTextColorActiveHover: selectedText,
      itemIconColorActiveHover: selectedText,
      itemTextColorHover: t.base,
    },

    Layout: {
      color: '#b8b8b8',
      siderColor: '#c8c8c8',
      siderBorderColor: '#b0b0b0',
    },

    Card: {
      color: '#d8d8d8',
      borderColor: '#bebebe',
    },

    AutoComplete: {
      peers: {
        InternalSelectMenu: { height: '500px', color: '#d0d0d0', optionTextColor: 'rgba(0,0,0,0.75)', optionTextColorActive: t.base },
      },
    },

    Popover: {
      color: '#d0d0d0',
      textColor: '#1a1e22',
    },

    Select: {
      peers: {
        InternalSelectMenu: { color: '#d0d0d0', optionTextColor: 'rgba(0,0,0,0.75)', optionTextColorActive: t.base, optionColorActive: a(t.rgb, 0.10), optionColorActivePending: a(t.rgb, 0.15) },
      },
    },
  };
}

// Surface palettes for the dark-family themes (accent fields injected per call)
const SURFACES: Record<Exclude<KtThemeKey, 'light'>, Omit<DarkPalette, 'accent' | 'accentHex' | 'accentHover' | 'accentPressed' | 'accentSel'>> = {
  black: { bg: '#0d0d0d', chrome: '#000000', chromeBorder: '#1f1f1f', panel: '#000000', panelBorder: '#2a2a2a', input: '#000000', popup: '#121212', tableTd: '#000000', tableTh: '#050505', notif: '#121212' },
  dark: { bg: '#333333', chrome: '#1c1c1c', chromeBorder: '#2e2e2e', panel: '#3a3a3a', panelBorder: '#2e2e2e', input: '#2b2b2b', popup: '#141414', tableTd: '#2f2f2f', tableTh: '#262626', notif: '#141414' },
  blood: { bg: '#4a1f20', chrome: '#1e0a0b', chromeBorder: '#3a1a1d', panel: '#321416', panelBorder: '#3a1a1d', input: '#2a1012', popup: '#160607', tableTd: '#321416', tableTh: '#3a1a1d', notif: '#160607', text: '#fffde8', text2: '#b09e9c', textAccent: '#f8c99e' },
  greed: { bg: '#0a5234', chrome: '#001e13', chromeBorder: '#07371f', panel: '#003824', panelBorder: '#07371f', input: '#00301f', popup: '#00140c', tableTd: '#003824', tableTh: '#07371f', notif: '#00140c', text: '#fffde8', text2: '#a6a99a', textAccent: '#e0d49a' },
  cyanotic: { bg: '#0a4a6e', chrome: '#001a28', chromeBorder: '#093250', panel: '#002e48', panelBorder: '#093250', input: '#00283e', popup: '#000f1a', tableTd: '#002e48', tableTh: '#093250', notif: '#000f1a', text: '#fffde8', text2: '#9ba3ac', textAccent: '#e0d49a' },
  // The six grunge themes, ported from the landing pages (kp.css/kd.css). Unlike
  // blood/greed/cyanotic these carry a REAL accent of their own, so textAccent is
  // that accent rather than a warm cream.
  ectoplasm: { bg: '#293c3f', chrome: '#314548', chromeBorder: '#096366', panel: '#293c3f', panelBorder: '#096366', input: '#223335', popup: '#1c292b', tableTd: '#293c3f', tableTh: '#096366', notif: '#1c292b', text: '#f4f4f0', text2: '#d7d7cf', textAccent: '#ead900' },
  decay: { bg: '#403f3b', chrome: '#514e48', chromeBorder: '#5c554c', panel: '#403f3b', panelBorder: '#5c554c', input: '#35342f', popup: '#2b2d32', tableTd: '#403f3b', tableTh: '#5c554c', notif: '#2b2d32', text: '#f2f4f3', text2: '#d8cfb5', textAccent: '#d1c8aa' },
  malaise: { bg: '#303638', chrome: '#3f4947', chromeBorder: '#394742', panel: '#303638', panelBorder: '#394742', input: '#2b3133', popup: '#171c1d', tableTd: '#303638', tableTh: '#394742', notif: '#171c1d', text: '#f2f4f3', text2: '#d8cfb5', textAccent: '#ffb199' },
  sepulchre: { bg: '#3a352f', chrome: '#454039', chromeBorder: '#4d3d2b', panel: '#3a352f', panelBorder: '#4d3d2b', input: '#302c26', popup: '#242729', tableTd: '#3a352f', tableTh: '#4d3d2b', notif: '#242729', text: '#f4f4f0', text2: '#d7d7cf', textAccent: '#8ccac8' },
  delirium: { bg: '#343344', chrome: '#3e3c50', chromeBorder: '#5c527d', panel: '#343344', panelBorder: '#5c527d', input: '#2b2a38', popup: '#24212b', tableTd: '#343344', tableTh: '#5c527d', notif: '#24212b', text: '#f4f4f0', text2: '#d7d7cf', textAccent: '#f29200' },
  mourning: { bg: '#554c5d', chrome: '#3b3642', chromeBorder: '#756b79', panel: '#554c5d', panelBorder: '#756b79', input: '#463f4d', popup: '#2b2730', tableTd: '#554c5d', tableTh: '#756b79', notif: '#2b2730', text: '#f4f4f0', text2: '#d7d7cf', textAccent: '#ffa9bd' },
  // KillerUI Themes/TrashPolka.xaml: Surface #333 pane, black chrome, Pane #3a3a3a cards
  trashpolka: { bg: '#333333', chrome: '#000000', chromeBorder: '#2e2e2e', panel: '#3a3a3a', panelBorder: '#4a4a4a', input: '#000000', popup: '#121212', tableTd: '#3a3a3a', tableTh: '#2e2e2e', notif: '#121212', text: '#f2f2f2', text2: '#bdbdbd' },
};

// Fixed button/control colors for the colored themes (landing --btn):
// Blood/Cyanotic solid controls are green, Greed's are gold. Text accents for
// these themes are the WHITE landing --accent, set in the CSS var table.
const FIXED_ACCENTS: Partial<Record<KtThemeKey, AccentTriple>> = {
  blood: { base: '#1ea54c', hover: '#2EBD5E', pressed: '#178A3F', sel: 'rgba(255, 255, 255, 0.27)', rgb: [30, 165, 76] },
  greed: { base: '#e6b800', hover: '#F2CA1F', pressed: '#C19B00', sel: 'rgba(255, 255, 255, 0.27)', rgb: [230, 184, 0] },
  cyanotic: { base: '#1ea54c', hover: '#2EBD5E', pressed: '#178A3F', sel: 'rgba(255, 255, 255, 0.27)', rgb: [30, 165, 76] },
  // Grunge themes: base = the theme's own accent; sel = the landing tab-edge.
  // Primary/hover/pressed trios match KillerUI Themes/*.xaml (audited 2026-11-23).
  // Malaise: peach primary, teal SelectionBg #365b58, mint tab edge in App.vue.
  ectoplasm: { base: '#ead900', hover: '#eddf29', pressed: '#beb109', sel: 'rgba(234, 217, 0, 0.42)', rgb: [234, 217, 0] },
  decay: { base: '#d1c8aa', hover: '#c2b280', pressed: '#9a8f68', sel: '#8a8a78', rgb: [209, 200, 170] },
  malaise: { base: '#ffb199', hover: '#ff8f6e', pressed: '#e85e80', sel: '#365b58', rgb: [255, 177, 153] },
  sepulchre: { base: '#8ccac8', hover: '#6bb8b6', pressed: '#458d8c', sel: 'rgba(140, 202, 200, 0.42)', rgb: [140, 202, 200] },
  delirium: { base: '#f29200', hover: '#e29929', pressed: '#b47009', sel: '#cf1020', rgb: [242, 146, 0] },
  mourning: { base: '#ffa9bd', hover: '#ff86a2', pressed: '#e85e80', sel: 'rgba(255, 169, 189, 0.42)', rgb: [255, 169, 189] },
};

export function buildOverridesFor(theme: KtThemeKey, accent?: KtAccentKey | ''): GlobalThemeOverrides {
  const t = accentTriple(theme, accent) ?? FIXED_ACCENTS[theme]!;
  if (theme === 'light') {
    return buildLightOverrides(t);
  }
  const s = SURFACES[theme as Exclude<KtThemeKey, 'light'>];
  const selText = theme === 'trashpolka' && t.sel === '#EED500' ? '#111111' : undefined;
  return buildDarkOverrides({ ...s, accent: t.rgb, accentHex: t.base, accentHover: t.hover, accentPressed: t.pressed, accentSel: t.sel, selText });
}

// ── Back-compat exports (default accents) ──
export const lightThemeOverrides: GlobalThemeOverrides = buildOverridesFor('light');
export const darkThemeOverrides: GlobalThemeOverrides = buildOverridesFor('black');

export interface KtThemeDef {
  key: KtThemeKey
  label: string
  isDark: boolean
  swatchBg: string
  swatchAccent: string
}

export const ktThemes: KtThemeDef[] = [
  { key: 'dark', label: 'Dark', isDark: true, swatchBg: '#2b2b2b', swatchAccent: '#50AEE8' },
  { key: 'light', label: 'Light', isDark: false, swatchBg: '#e8e8e8', swatchAccent: '#18608E' },
  { key: 'black', label: 'Black', isDark: true, swatchBg: '#000000', swatchAccent: '#0AFFE7' },
  { key: 'blood', label: 'Blood', isDark: true, swatchBg: '#73000e', swatchAccent: '#f8c99e' },
  { key: 'greed', label: 'Greed', isDark: true, swatchBg: '#004d32', swatchAccent: '#e0d49a' },
  { key: 'cyanotic', label: 'Cyanotic', isDark: true, swatchBg: '#003450', swatchAccent: '#e0d49a' },
  { key: 'ectoplasm', label: 'Ectoplasm', isDark: true, swatchBg: '#5e1764', swatchAccent: '#ead900' },
  { key: 'decay', label: 'Decay', isDark: true, swatchBg: '#403f3b', swatchAccent: '#d1c8aa' },
  { key: 'malaise', label: 'Malaise', isDark: true, swatchBg: '#563343', swatchAccent: '#ffb199' },
  { key: 'sepulchre', label: 'Sepulchre', isDark: true, swatchBg: '#3a352f', swatchAccent: '#8ccac8' },
  { key: 'delirium', label: 'Delirium', isDark: true, swatchBg: '#641d25', swatchAccent: '#f29200' },
  { key: 'mourning', label: 'Mourning', isDark: true, swatchBg: '#554c5d', swatchAccent: '#ffa9bd' },
  { key: 'trashpolka', label: 'Trash Polka', isDark: true, swatchBg: '#000000', swatchAccent: '#D7263D' },
];

export const ktThemeByKey = Object.fromEntries(ktThemes.map(t => [t.key, t])) as Record<KtThemeKey, KtThemeDef>;

// Field (text input) fill for a colored theme; neutral themes return null and
// keep their tuned CSS field tones
export function themeInputColor(theme: KtThemeKey): string | null {
  if (NEUTRAL_THEMES.includes(theme)) {
    return null;
  }
  return SURFACES[theme as Exclude<KtThemeKey, 'light'>]?.input ?? null;
}
