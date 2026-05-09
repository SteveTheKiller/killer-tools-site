import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0d7033FF',
    primaryColorHover: '#1ea54cFF',
    primaryColorPressed: '#0a5a28FF',
    primaryColorSuppl: '#1ea54cFF',
    bodyColor: '#cccccc',
    textColorBase: '#1a1e22',
    textColor1: '#1a1e22',
    textColor2: '#2e3440',
    textColor3: '#485060',
    placeholderColor: '#6a7280',
  },

  Menu: {
    itemHeight: '32px',
    color: '#c0c0c0',
    itemTextColor: '#1e2022',
    itemTextColorActive: '#0d7033',
    itemTextColorHover: '#0d7033',
    itemColorActive: 'rgba(13, 112, 51, 0.12)',
    itemColorActiveHover: 'rgba(13, 112, 51, 0.18)',
  },

  Layout: {
    color: '#cccccc',
    siderColor: '#c0c0c0',
    siderBorderColor: '#aaaaaa',
  },

  Card: {
    color: '#d8d8d8',
    borderColor: '#bebebe',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
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
  },

  Layout: {
    color: '#2b2b2b',
    siderColor: '#262626',
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
    color: '#0f0f11',
    colorFocus: '#111114',
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
