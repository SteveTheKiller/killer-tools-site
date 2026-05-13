import { defineThemes } from '../theme/theme.models';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderColor: 'rgba(0, 0, 0, 0.35)',

    focus: {
      backgroundColor: 'rgba(0, 0, 0, 0.50)',
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
