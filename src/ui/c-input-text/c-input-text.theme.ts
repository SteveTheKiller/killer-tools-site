import { defineThemes } from '../theme/theme.models';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: '#333333',
    borderColor: '#333333',

    focus: {
      backgroundColor: '#1ea54c1a',
    },
  },
  light: {
    backgroundColor: '#c8c8c8',
    borderColor: '#adadad',

    focus: {
      backgroundColor: '#c4c4c4',
    },
  },
});
