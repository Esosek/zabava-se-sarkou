import { getCalendar } from './calendar';

export async function createEvent(event) {
  const calendar = getCalendar();
  try {
    const response = await calendar.events.insert({
      calendarId: import.meta.env.CALENDAR_ID,
      resource: event,
    });
    console.log('Event created:', response.data);
    return true;
  } catch (error) {
    console.error('Error creating event:', error);
    return false;
  }
}
