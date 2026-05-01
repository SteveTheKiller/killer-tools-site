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
      InternalSelectMenu: { height: '500px', color: '#1e1e1e' },
    },
  },

  Menu: {
    itemHeight: '32px',
  },

  Layout: {
    color: '#1c1c1c',
    siderColor: '#232323',
    siderBorderColor: 'transparent',
  },

  Card: {
    color: '#232323',
    borderColor: '#282828',
  },

  Table: {
    tdColor: '#232323',
    thColor: '#353535',
  },
};
