import { getCalendar } from './calendar';

export async function getReservedDates() {
  try {
    const calendar = getCalendar();

    const now = new Date();
    const oneYearFromNow = new Date(
      now.getFullYear() + 1,
      now.getMonth(),
      now.getDate()
    );

    const response = await calendar.events.list({
      calendarId: import.meta.env.CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: oneYearFromNow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items.filter(
      (item) => item.start.date && item.end.date
    ); // Filter full-day events

    const unavailableDates = new Set();

    events.forEach((item) => {
      const startDate = new Date(item.start.date);
      const endDate = new Date(item.end.date);
      const currentDate = new Date(startDate);

      // Add all dates between start date and end date (exclusive)
      while (currentDate < endDate) {
        unavailableDates.add(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return [...unavailableDates];
  } catch (error) {
    console.error('Error fetching reserved dates:', error);
    return { error: 'Error fetching reserved dates' };
  }
}
