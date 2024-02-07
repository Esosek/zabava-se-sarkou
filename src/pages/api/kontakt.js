import nodemailer from 'nodemailer';

export const prerender = false;

export async function POST({ request }) {
  try {
    const requestData = await request.formData();
    const formData = getFormData(requestData);

    validateFormData(formData);
    await sendEmail(formData);

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

  if (userMessage.trim().length < 25 || userMessage.trim().length > 1500) {
    errors.push('user message is too short or too long');
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
}

async function sendEmail(userData) {
  const mailTransporter = setupMailTransporter();
  const mailDetails = prepareMailContent(userData);

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

function prepareMailContent({
  userName,
  userEmail,
  selectedService,
  userMessage,
  userSubscribe,
}) {
  const emailTo = import.meta.env.EMAIL_TO_ADDRESS;
  const content = `<div>
  <p><strong>Email:</strong> ${userEmail}</p>
  <p><strong>Jméno:</strong> ${userName}</p>
  <p><strong>Vybraný program:</strong> ${selectedService}</p>
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
