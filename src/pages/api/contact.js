import nodemailer from 'nodemailer';

export async function POST({ request }) {
  try {
    const requestData = await request.formData();
    const formData = getFormData(requestData);
    const validatedFormData = validateFormData(formData);
    const result = await sendEmail(validatedFormData);

    return new Response(JSON.stringify('Form proccessing succeeded'), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      status: error.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

function getFormData(data) {
  const result = {};
  result.userName = data.get('name');
  result.userEmail = data.get('email');
  result.userMessage = data.get('message');
  result.userSubscribe = data.get('subscribe');
  return result;
}

function validateFormData(formData) {
  // validation
  return formData;
}

async function sendEmail(userData) {
  const mailTransporter = setupMailTransporter();
  const mailDetails = prepareMailContent(userData);

  let mailresult;
  try {
    mailresult = await mailTransporter.sendMail(mailDetails);
  } catch (error) {
    console.log('Sending email failed: ', error);
  }
  console.log('Email sent: ', mailresult?.messageId);
  return;
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
  userMessage,
  userSubscribe,
}) {
  const emailTo = import.meta.env.EMAIL_TO_ADDRESS;
  const content = `<div>
  <p><strong>Email:</strong> ${userEmail}</p>
  <p><strong>Jméno:</strong> ${userName}</p>    
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
