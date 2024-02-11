import { google } from 'googleapis';

export function getCalendar() {
  try {
    return google.calendar({
      version: 'v3',
      project: import.meta.env.PROJECT_NUMBER,
      auth: authJWT(),
    });
  } catch (error) {
    throw Error('Loading calendar failed:', error);
  }
}

function authJWT() {
  return new google.auth.JWT(
    import.meta.env.SERVICE_EMAIL_ADDRESS,
    null,
    import.meta.env.SERVICE_PRIVATE_KEY,
    'https://www.googleapis.com/auth/calendar.events'
  );
}
