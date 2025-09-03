import * as FileSystem from 'expo-file-system';


export const sendCodeWithResend = async (email) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  const data = {
   from: 'Ribit Code <onboarding@resend.dev>',
    to: email,
    subject: 'Your Verification Code',
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
      Authorization: `Bearer re_YmnAtMY8_ME9RoH3JSJ85g133y5pvVGvR`, // your real key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Email sent:', result);

    return { code, success: true };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { code: null, success: false, error: error.message };
  }
};



export const sendToResend = async (fileUri, filename, subject = 'Driver Verification Documents') => {
  const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer re_YmnAtMY8_ME9RoH3JSJ85g133y5pvVGvR`, // your real key
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Ribit Uploads <onboarding@resend.dev>',
        to: ['ribitapp@gmail.com'],
      subject: subject,
      html: `<p>Attached is the document: ${filename}</p>`,
      attachments: [
        {
          filename: filename,
          content: fileBase64,
        },
      ],
    }),
  });

  const result = await response.json();
  console.log('✅ Email sent:', result);
};