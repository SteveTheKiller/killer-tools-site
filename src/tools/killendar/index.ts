// Calendar, not CalendarEvent: this one is proven in the codebase (date-time-converter imports
// it), whereas CalendarEvent was used nowhere and could not be verified against the installed
// package. An icon name that does not exist fails the build, not just the render.
import { Calendar } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'The Killendar',
  path: '/killendar',
  description: 'Encrypted desktop calendar for Windows. Month, week, day and agenda views, color categories, iCalendar import and export, and appointments that stay in one file on your own machine. No account, no sync, no telemetry.',
  keywords: ['calendar', 'appointments', 'schedule', 'encrypted', 'sqlcipher', 'ical', 'icalendar', 'ics', 'kcal', 'agenda', 'killendar'],
  component: () => import('./killendar.vue'),
  icon: Calendar,
  isNew: true,
  fullscreen: true,
  createdAt: new Date('2026-07-30'),
});
