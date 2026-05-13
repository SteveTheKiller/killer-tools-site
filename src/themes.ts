import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0d7033FF',
    primaryColorHover: '#1ea54cFF',
    primaryColorPressed: '#0a5a28FF',
    primaryColorSuppl: '#1ea54cFF',
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
    itemTextColorActive: '#0d7033',
    itemTextColorHover: '#0d7033',
    itemColorActive: 'rgba(13, 112, 51, 0.12)',
    itemColorActiveHover: 'rgba(13, 112, 51, 0.18)',
  },

  Layout: {
    color: '#b8b8b8',
    siderColor: '#b0b0b0',
    siderBorderColor: '#aaaaaa',
  },

  Card: {
    color: '#d8d8d8',
    borderColor: '#bebebe',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#d0d0d0', optionTextColor: 'rgba(0,0,0,0.75)', optionTextColorActive: '#0d7033' },
    },
  },

  Popover: {
    color: '#d0d0d0',
    textColor: '#1a1e22',
  },

  Select: {
    peers: {
      InternalSelectMenu: { color: '#d0d0d0', optionTextColor: 'rgba(0,0,0,0.75)', optionTextColorActive: '#0d7033', optionColorActive: 'rgba(13,112,51,0.10)', optionColorActivePending: 'rgba(13,112,51,0.15)' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#1ea54cFF',
    primaryColorHover: '#36AD6AFF',
    primaryColorPressed: '#0C7A43FF',
    primaryColorSuppl: '#36AD6AFF',
  },

  Notification: {
    color: '#333333',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#141414' },
    },
  },

  Menu: {
    itemHeight: '32px',
    color: 'transparent',
    itemColorActive: 'rgba(30, 165, 76, 0.12)',
    itemColorActiveHover: '#1c502c',
    itemTextColorActive: '#1ea54c',
    itemIconColorActive: '#1ea54c',
    itemTextColorActiveHover: 'rgba(255, 255, 255, 0.92)',
    itemIconColorActiveHover: 'rgba(255, 255, 255, 0.92)',
    itemTextColorChildActive: '#1ea54c',
    itemIconColorChildActive: '#1ea54c',
    itemColorHover: 'rgba(255, 255, 255, 0.07)',
    itemTextColorHover: 'rgba(255, 255, 255, 0.92)',
    itemIconColorHover: 'rgba(255, 255, 255, 0.92)',
  },

  Layout: {
    color: '#2b2b2b',
    siderColor: '#111111',
    siderBorderColor: 'rgba(30, 165, 76, 0.1)',
  },

  Card: {
    color: '#1e1e1e',
    borderColor: '#2a2a2a',
  },

  Button: {
    color: 'rgba(0, 0, 0, 0.3)',
    colorHover: 'rgba(30, 165, 76, 0.1)',
    colorPressed: 'rgba(30, 165, 76, 0.18)',
    colorFocus: 'rgba(30, 165, 76, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderHover: '1px solid rgba(30, 165, 76, 0.5)',
    borderPressed: '1px solid rgba(30, 165, 76, 0.7)',
    borderFocus: '1px solid rgba(30, 165, 76, 0.5)',
    textColor: 'rgba(255, 255, 255, 0.6)',
    textColorHover: '#1ea54c',
    textColorPressed: '#4dd07a',
    textColorFocus: '#1ea54c',
    borderRadius: '12px',
    fontWeight: '500',
  },

  Input: {
    color: 'rgba(0, 0, 0, 0.35)',
    colorFocus: 'rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(30, 165, 76, 0.28)',
    borderHover: '1px solid rgba(30, 165, 76, 0.55)',
    borderFocus: '1px solid rgba(30, 165, 76, 0.75)',
    textColor: 'rgba(255, 255, 255, 0.85)',
    textColorDisabled: 'rgba(255, 255, 255, 0.3)',
    placeholderColor: 'rgba(255, 255, 255, 0.2)',
    caretColor: '#1ea54c',
    boxShadowFocus: '0 0 0 2px rgba(30, 165, 76, 0.12)',
  },

  Table: {
    tdColor: '#232323',
    thColor: '#353535',
  },
};
