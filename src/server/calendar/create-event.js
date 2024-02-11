async function createEvent(calendar) {
  const event = {
    summary: 'Test událost',
    location: 'Location',
    description: 'Description',
    start: {
      dateTime: '2024-02-16T10:00:00',
      timeZone: 'UTC',
    },
    end: {
      dateTime: '2024-02-16T12:00:00',
      timeZone: 'UTC',
    },
  };
  try {
    const response = await calendar.events.insert({
      calendarId: import.meta.env.CALENDAR_ID, // Calendar ID where the event will be created
      resource: event,
    });
    console.log('Event created:', response.data);
  } catch (error) {
    console.error('Error creating event:', error);
  }
}
