import nodemailer from 'nodemailer';
import { createEvent as createCalendarEvent } from '../../server/calendar/create-event';

export const prerender = false;

export async function POST({ request }) {
  try {
    const requestData = await request.formData();
    const formData = getFormData(requestData);

    validateFormData(formData);

    const isEventCreated = await createEvent(formData);
    await sendEmail(formData, isEventCreated);

    return new Response(JSON.stringify('Form proccessed sucessfully'), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

function getFormData(data) {
  const result = {};
  result.userName = escapeInput(data.get('name'));
  result.userEmail = escapeInput(data.get('email'));
  result.selectedService = escapeInput(data.get('service-select'));
  result.selectedDate = escapeInput(data.get('date'));
  result.userMessage = escapeInput(data.get('message'));
  result.userSubscribe = data.get('subscribe');
  result.honeypot = data.get('user-number');
  return result;
}

function escapeInput(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateFormData({
  userName,
  userEmail,
  selectedService,
  selectedDate,
  userMessage,
  userSubscribe,
  honeypot,
}) {
  const errors = [];

  if (userName.trim().length < 3 || userName.trim().length > 50) {
    errors.push('user name is too short or too long');
  }

  if (!isEmailValid(userEmail)) {
    errors.push('email is not in a valid format');
  }

  if (!isServiceValid(selectedService)) {
    errors.push('selected service is not valid');
  }

  if (!isDateValid(selectedDate)) {
    errors.push('selected date is not valid');
  }

  if (userMessage.trim().length > 1500) {
    errors.push('user message is too long');
  }

  if (honeypot.length !== 0) {
    errors.push('bot detected');
  }

  if (errors.length !== 0) {
    throw new Error(`Form validation failed: ${errors.join(', ')}`);
  }

  function isEmailValid(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return regex.test(email.trim());
  }

  function isServiceValid(service) {
    const regex = /[\p{L}-]/gu;
    return regex.test(service.trim());
  }

  function isDateValid(date) {
    // Validate date format 'YYYY-MM-DD'
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateFormatRegex.test(date)) {
      return false;
    }

    return !isNaN(new Date(date).getTime());
  }
}

async function createEvent({ selectedDate, userName, selectedService }) {
  const dateStart = new Date(selectedDate);
  const dateEnd = new Date(dateStart);
  dateEnd.setDate(dateStart.getDate() + 1);

  return await createCalendarEvent({
    summary: `${selectedService} - ${userName}`,
    // location: formData.location,
    start: {
      date: dateStart.toISOString().split('T')[0],
    },
    end: {
      date: dateEnd.toISOString().split('T')[0],
    },
  });
}

async function sendEmail(userData, isEventCreated) {
  const mailTransporter = setupMailTransporter();
  const mailDetails = prepareMailContent(userData, isEventCreated);

  try {
    return await mailTransporter.sendMail(mailDetails);
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

function setupMailTransporter() {
  const host = 'smtp.gmail.com';
  const email = import.meta.env.EMAIL_ADDRESS;
  const pass = import.meta.env.EMAIL_PASSWORD;
  const clientId = import.meta.env.OAUTH_CLIENTID;
  const clientSecret = import.meta.env.OAUTH_CLIENT_SECRET;
  const refreshToken = import.meta.env.OAUTH_REFRESH_TOKEN;

  const mailTransporter = nodemailer.createTransport({
    host,
    port: 587,
    secure: false,
    auth: {
      type: 'OAuth2',
      user: email,
      pass: pass,
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refreshToken,
    },
  });

  return mailTransporter;
}

function prepareMailContent(
  {
    userName,
    userEmail,
    selectedService,
    selectedDate,
    userMessage,
    userSubscribe,
  },
  isEventCreated
) {
  const emailTo = import.meta.env.EMAIL_TO_ADDRESS;
  const content = `<div>
  <p><strong>Email:</strong> ${userEmail}</p>
  <p><strong>Jméno:</strong> ${userName}</p>
  <p><strong>Vybraný program:</strong> ${selectedService}</p>
  <p><strong>Datum:</strong> ${selectedDate} - ${
    isEventCreated ? 'Událost vytvořena' : 'Událost nebyla vytvořena!'
  }</p>
  <p><strong>Zpráva:</strong> ${userMessage}</p>
  <p><strong>Přihlášení k odběru:</strong> ${
    userSubscribe === 'on' ? 'ano' : 'ne'
  }</p>
  </div>`;

  return {
    from: userEmail,
    to: emailTo,
    subject: `Zpráva z webu od ${userName}`,
    html: content,
  };
}
