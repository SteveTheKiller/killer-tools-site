import { defineThemes } from '../theme/theme.models';
import { appThemes } from '../theme/themes';

const sizes = {
  small: {
    height: '28px',
    fontSize: '12px',
  },
  medium: {
    height: '34px',
    fontSize: '14px',
  },
  large: {
    height: '40px',
    fontSize: '16px',
  },
};

export const { useTheme } = defineThemes({
  dark: {
    sizes,

    backgroundColor: '#333333',
    borderColor: '#333333',
    dropdownShadow: 'rgba(0, 0, 0, 0.2) 0px 8px 24px',

    option: {
      hover: {
        backgroundColor: '#444444',
      },
      active: {
        textColor: appThemes.dark.primary.color,
      },
    },

    focus: {
      backgroundColor: 'rgba(var(--kt-accent-rgb), 0.10)',
    },
  },
  light: {
    sizes,

    backgroundColor: '#c8c8c8',
    borderColor: '#adadad',
    dropdownShadow: 'rgba(0, 0, 0, 0.18) 0px 8px 24px',

    option: {
      hover: {
        backgroundColor: '#c0c0c0',
      },
      active: {
        textColor: appThemes.light.primary.color,
      },
    },

    focus: {
      backgroundColor: '#c4c4c4',
    },
  },
});
